# Auth Patterns Reference

## Auth Decision Tree

```
What do you need?
│
├── Social login (Google, GitHub, etc.) or enterprise SSO?
│   └── OAuth2 / OIDC — use Auth.js (NextAuth) or a managed provider
│
├── Passwordless, low-friction consumer app?
│   └── Magic link (email OTP) or Passkeys (WebAuthn)
│
├── B2B SaaS with multi-tenant orgs, SAML, advanced roles?
│   └── Managed provider: Clerk, WorkOS, Auth0, Stytch
│
└── Full control, own the data, internal app?
    └── Auth.js (Next.js) or Lucia (framework-agnostic)
```

**Default recommendation**: Use **Auth.js v5** for Next.js projects — handles OAuth2/OIDC, sessions, JWTs, and DB adapters out of the box. Never roll your own auth unless absolutely necessary.

---

## Auth.js v5 (NextAuth) — Setup

```ts
// auth.ts (root of project)
import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from '@/lib/db';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    // Attach role to session from DB
    session({ session, user }) {
      session.user.role = user.role;
      return session;
    },
    // Restrict sign-in by email domain
    signIn({ user, account }) {
      if (account?.provider === 'google') {
        return user.email?.endsWith('@yourcompany.com') ?? false;
      }
      return true;
    },
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
});
```

```ts
// app/api/auth/[...nextauth]/route.ts
import { handlers } from '@/auth';
export const { GET, POST } = handlers;
```

```ts
// middleware.ts — protect routes
import { auth } from '@/auth';

export default auth((req) => {
  if (!req.auth && req.nextUrl.pathname.startsWith('/dashboard')) {
    return Response.redirect(new URL('/login', req.url));
  }
});

export const config = { matcher: ['/dashboard/:path*'] };
```

```tsx
// Server Component — access session
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect('/login');
  return <div>Hello, {session.user.name}</div>;
}
```

---

## OAuth2 / OIDC — Concepts

### Flow selection

| Flow | Use case |
|------|----------|
| **Authorization Code + PKCE** | Web apps, SPAs, mobile — always use PKCE |
| **Client Credentials** | Machine-to-machine, no user involved |
| **Device Code** | CLIs, TVs, devices without a browser |
| ~~Implicit~~ | **Deprecated** — never use |
| ~~Resource Owner Password~~ | **Deprecated** — never use |

### Authorization Code + PKCE (manual implementation)

```ts
import { createHash, randomBytes } from 'crypto';

// Step 1: Generate PKCE verifier + challenge
function generatePKCE() {
  const verifier = randomBytes(32).toString('base64url');
  const challenge = createHash('sha256').update(verifier).digest('base64url');
  return { verifier, challenge };
}

// Step 2: Build authorization URL
function buildAuthUrl(clientId: string, redirectUri: string, codeChallenge: string, state: string) {
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'openid email profile');
  url.searchParams.set('state', state);                    // CSRF protection
  url.searchParams.set('code_challenge', codeChallenge);
  url.searchParams.set('code_challenge_method', 'S256');
  return url.toString();
}

// Step 3: Exchange code for tokens (server-side only — never in browser)
async function exchangeCode(code: string, verifier: string, redirectUri: string) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: process.env.OAUTH_CLIENT_ID!,
      client_secret: process.env.OAUTH_CLIENT_SECRET!,
      code_verifier: verifier,
    }),
  });
  if (!res.ok) throw new Error('Token exchange failed');
  return res.json() as Promise<{ access_token: string; id_token: string; refresh_token: string }>;
}
```

### Token storage rules
| Token | Storage | Never |
|-------|---------|-------|
| Access token | `httpOnly` cookie or memory | `localStorage`, `sessionStorage` |
| Refresh token | `httpOnly`, `Secure`, `SameSite=Strict` cookie | JS-accessible storage |
| ID token | Verify, extract claims, discard | Store long-term |

### ID token verification (OIDC)
```ts
import { createRemoteJWKSet, jwtVerify } from 'jose';

const JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/oauth2/v3/certs')
);

async function verifyIdToken(token: string) {
  const { payload } = await jwtVerify(token, JWKS, {
    issuer: 'https://accounts.google.com',
    audience: process.env.OAUTH_CLIENT_ID,
  });
  return payload; // contains sub, email, name, etc.
}
```

---

## Magic Link (Email OTP)

### Flow
1. User submits email → server creates short-lived signed token stored in DB
2. Server emails a link containing the token
3. User clicks link → server verifies + invalidates token → creates session
4. Token is single-use and time-limited

### Implementation

```ts
import { SignJWT, jwtVerify } from 'jose';
import { randomBytes } from 'crypto';

const secret = new TextEncoder().encode(process.env.MAGIC_LINK_SECRET!);

export async function createMagicLink(email: string): Promise<string> {
  const tokenId = randomBytes(16).toString('hex');

  await db.magicTokens.create({
    data: {
      id: tokenId,
      email,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      used: false,
    },
  });

  const token = await new SignJWT({ email, jti: tokenId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(secret);

  return `${process.env.APP_URL}/auth/verify?token=${token}`;
}

export async function verifyMagicLink(token: string): Promise<string> {
  const { payload } = await jwtVerify(token, secret);
  const { email, jti } = payload as { email: string; jti: string };

  // Find record — must be unused and unexpired
  const record = await db.magicTokens.findFirst({
    where: { id: jti, email, used: false, expiresAt: { gt: new Date() } },
  });
  if (!record) throw new Error('Invalid or expired link');

  // Mark used BEFORE creating session (prevent replay)
  await db.magicTokens.update({ where: { id: jti }, data: { used: true } });

  return email;
}
```

```ts
// POST /api/auth/magic — initiate
app.post('/api/auth/magic',
  rateLimit({ windowMs: 60 * 60 * 1000, max: 5 }), // 5/hour per IP
  async (req, res) => {
    const { email } = req.body;
    const link = await createMagicLink(email);
    await sendEmail({ to: email, subject: 'Your sign-in link', body: link });
    res.json({ message: 'Check your email' }); // always 200 — don't leak existence
  }
);

// GET /api/auth/verify — complete
app.get('/api/auth/verify', async (req, res) => {
  const email = await verifyMagicLink(req.query.token as string);
  const user = await db.users.upsert({ where: { email }, create: { email }, update: {} });
  await createSession(req, user);
  res.redirect('/dashboard');
});
```

### Magic link security rules
- Tokens expire in **≤ 15 minutes**
- **Single-use** — mark used atomically before creating session
- Store token IDs in DB to allow revocation
- **Never leak email existence** — always return 200 on send
- Rate limit: 5 send attempts per email per hour

---

## Passkeys (WebAuthn)

Passkeys use asymmetric cryptography — private key never leaves the device. Biometric or PIN verifies locally.

### Recommended library
```bash
npm install @simplewebauthn/server @simplewebauthn/browser
```

### Registration flow

```ts
// Server
import { generateRegistrationOptions, verifyRegistrationResponse } from '@simplewebauthn/server';

export async function startPasskeyRegistration(userId: string, userName: string) {
  const options = await generateRegistrationOptions({
    rpName: 'Your App',
    rpID: process.env.RP_ID!,              // 'yourapp.com'
    userID: new TextEncoder().encode(userId),
    userName,
    attestationType: 'none',
    authenticatorSelection: {
      residentKey: 'required',             // discoverable credential (no username needed at login)
      userVerification: 'required',        // biometric/PIN required
    },
  });

  await storeChallenge(userId, options.challenge); // store for verification step
  return options;
}

export async function finishPasskeyRegistration(
  userId: string,
  response: RegistrationResponseJSON
) {
  const verification = await verifyRegistrationResponse({
    response,
    expectedChallenge: await getChallenge(userId),
    expectedOrigin: process.env.APP_ORIGIN!,
    expectedRPID: process.env.RP_ID!,
  });

  if (!verification.verified || !verification.registrationInfo) {
    throw new Error('Registration verification failed');
  }

  const { credential } = verification.registrationInfo;

  await db.credentials.create({
    data: {
      userId,
      credentialId: credential.id,
      publicKey: Buffer.from(credential.publicKey),
      counter: credential.counter,
      transports: response.response.transports ?? [],
    },
  });
}
```

```ts
// Browser
import { startRegistration } from '@simplewebauthn/browser';

async function registerPasskey() {
  const options = await fetch('/api/auth/passkey/register/start').then(r => r.json());
  const response = await startRegistration({ optionsJSON: options });
  await fetch('/api/auth/passkey/register/finish', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(response),
  });
}
```

### Authentication flow

```ts
// Server
import { generateAuthenticationOptions, verifyAuthenticationResponse } from '@simplewebauthn/server';

export async function startPasskeyAuth() {
  const options = await generateAuthenticationOptions({
    rpID: process.env.RP_ID!,
    userVerification: 'required',
  });
  await storeChallenge('anon', options.challenge);
  return options;
}

export async function finishPasskeyAuth(response: AuthenticationResponseJSON) {
  const credential = await db.credentials.findUnique({
    where: { credentialId: response.id },
    include: { user: true },
  });
  if (!credential) throw new Error('Credential not found');

  const verification = await verifyAuthenticationResponse({
    response,
    expectedChallenge: await getChallenge('anon'),
    expectedOrigin: process.env.APP_ORIGIN!,
    expectedRPID: process.env.RP_ID!,
    credential: {
      id: credential.credentialId,
      publicKey: new Uint8Array(credential.publicKey),
      counter: credential.counter,
      transports: credential.transports as AuthenticatorTransportFuture[],
    },
  });

  if (!verification.verified) throw new Error('Authentication failed');

  // Always update counter — detects cloned authenticators
  await db.credentials.update({
    where: { credentialId: response.id },
    data: { counter: verification.authenticationInfo.newCounter },
  });

  return credential.user;
}
```

```ts
// Browser
import { startAuthentication } from '@simplewebauthn/browser';

async function authenticateWithPasskey() {
  const options = await fetch('/api/auth/passkey/auth/start').then(r => r.json());
  const response = await startAuthentication({ optionsJSON: options });
  const result = await fetch('/api/auth/passkey/auth/finish', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(response),
  }).then(r => r.json());
  return result;
}
```

---

## Session Management

### Signed cookie sessions (recommended for web apps)

```ts
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

const key = new TextEncoder().encode(process.env.SESSION_SECRET!); // 32+ random bytes

interface SessionData {
  userId: string;
  role: string;
}

export async function createSession(data: SessionData) {
  const token = await new SignJWT(data)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key);

  const cookieStore = await cookies();
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export async function getSession(): Promise<SessionData | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, key);
    return payload as SessionData;
  } catch {
    return null;
  }
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}
```

### Session rotation — prevent fixation attacks
```ts
// Rotate on any privilege change: login, role change, password change
export async function rotateSession(userId: string) {
  await deleteSession();
  const user = await db.users.findUnique({ where: { id: userId } });
  await createSession({ userId, role: user!.role });
}
```

---

## RBAC (Role-Based Access Control)

```ts
const PERMISSIONS = {
  'post:read':   ['viewer', 'editor', 'admin'],
  'post:write':  ['editor', 'admin'],
  'post:delete': ['admin'],
  'user:manage': ['admin'],
} as const satisfies Record<string, readonly string[]>;

type Permission = keyof typeof PERMISSIONS;
type Role = 'viewer' | 'editor' | 'admin';

export function can(role: Role, permission: Permission): boolean {
  return (PERMISSIONS[permission] as readonly string[]).includes(role);
}

// Use in Server Actions
export async function requirePermission(permission: Permission) {
  const session = await getSession();
  if (!session || !can(session.role as Role, permission)) {
    throw new Error('Forbidden');
  }
  return session;
}
```

---

## Auth Security Checklist

- [ ] Tokens in `httpOnly` cookies — never `localStorage`
- [ ] `SameSite=Lax` minimum on all auth cookies (prevents most CSRF)
- [ ] Sessions invalidated server-side on logout
- [ ] Session rotated on login and privilege escalation
- [ ] Password reset tokens: single-use, ≤ 1 hour, old token invalidated on new request
- [ ] Magic link tokens: single-use, ≤ 15 min, rate limited
- [ ] Never expose whether an email exists in responses
- [ ] Failed login attempts rate-limited (5 attempts → 15 min lockout or delay)
- [ ] MFA available (TOTP with `otpauth` library, or passkeys)
- [ ] All auth events logged (login, logout, failed attempts, password change)
- [ ] `state` parameter validated in OAuth2 callback (CSRF)
- [ ] Redirect URIs strictly allowlisted in OAuth provider config
