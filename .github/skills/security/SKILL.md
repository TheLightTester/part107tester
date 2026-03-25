---
name: security-owasp
description: >
  Use this skill whenever security, vulnerabilities, or secure coding are
  mentioned. Triggers include: authentication, authorization, JWT, sessions,
  cookies, XSS, CSRF, SQL injection, input validation, sanitization, CORS,
  Content Security Policy (CSP), HTTPS, secrets management, rate limiting,
  OWASP, penetration testing, security headers, password hashing, encryption,
  secure file upload, or any request to "harden" or "secure" a web application.
  Also trigger when reviewing code that handles user input, credentials,
  file uploads, API keys, or database queries. Use proactively when building
  auth systems, API endpoints, or any feature that handles sensitive data.
---

# Security & OWASP Best Practices Skill

## Core Principle
**Never trust input. Validate, sanitize, and escape at every boundary.**

This skill maps to the **OWASP Top 10 (2021)** and provides actionable patterns for TypeScript/React/Node web applications.

---

## OWASP Top 10 — Quick Reference

| # | Category | Key Mitigation |
|---|----------|---------------|
| A01 | Broken Access Control | AuthZ checks on every request, deny by default |
| A02 | Cryptographic Failures | TLS everywhere, proper hashing (Argon2), no secrets in code |
| A03 | Injection | Parameterized queries, input validation, output encoding |
| A04 | Insecure Design | Threat modeling, secure defaults, defense in depth |
| A05 | Security Misconfiguration | Hardened headers, disable debug in prod, dependency audits |
| A06 | Vulnerable Components | `npm audit`, automated dependency updates (Renovate/Dependabot) |
| A07 | Auth & Session Failures | MFA, secure session management, rate limiting |
| A08 | Software Integrity Failures | SRI for CDN assets, signed releases, SAST in CI |
| A09 | Logging & Monitoring | Structured logs, audit trails, alerting on anomalies |
| A10 | SSRF | Allowlist outbound requests, block internal IP ranges |

---

## A01 — Access Control

### Middleware-first authorization
```ts
// ✅ Deny by default — must opt-in to access
function requireRole(role: Role) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !hasRole(req.user, role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

router.get('/admin/users', requireAuth, requireRole('admin'), getUsers);
```

### Object-level auth (IDOR prevention)
```ts
// ❌ Vulnerable — user can access any document
app.get('/documents/:id', async (req, res) => {
  const doc = await db.documents.findById(req.params.id);
  res.json(doc);
});

// ✅ Always scope queries to the authenticated user
app.get('/documents/:id', requireAuth, async (req, res) => {
  const doc = await db.documents.findOne({
    id: req.params.id,
    ownerId: req.user.id,  // ← ownership check
  });
  if (!doc) return res.status(404).json({ error: 'Not found' });
  res.json(doc);
});
```

---

## A02 — Cryptographic Failures

### Password hashing
```ts
import argon2 from 'argon2';

// Hash (on registration/password change)
const hash = await argon2.hash(password, {
  type: argon2.argon2id,
  memoryCost: 65536,  // 64MB
  timeCost: 3,
  parallelism: 4,
});

// Verify (on login)
const valid = await argon2.verify(storedHash, inputPassword);
```

Never use: MD5, SHA1, SHA256, bcrypt with cost < 12 for new code.
Prefer: **Argon2id** (modern), **bcrypt** (cost ≥ 12) as fallback.

### Secrets management
```ts
// ❌ Secrets in code
const apiKey = 'sk_live_abc123';

// ✅ Environment variables — never commit .env files with real secrets
const apiKey = process.env.STRIPE_SECRET_KEY;
if (!apiKey) throw new Error('STRIPE_SECRET_KEY is required');

// ✅ Validate all required env vars at startup
import { z } from 'zod';
const env = z.object({
  DATABASE_URL: z.string().url(),
  SESSION_SECRET: z.string().min(32),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
}).parse(process.env);
```

---

## A03 — Injection

### SQL injection prevention
```ts
// ❌ String concatenation — never
const query = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ Parameterized queries (Prisma, Drizzle, pg, etc.)
const user = await prisma.user.findUnique({ where: { email } });

// ✅ Raw queries with parameters
const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);
```

### XSS prevention in React
React escapes JSX by default. Danger zones:
```tsx
// ❌ NEVER — bypasses React's escaping
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// ✅ If you must render HTML, sanitize first
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userContent) }} />

// ✅ For markdown, use a safe renderer
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
<ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
```

### Input validation with Zod
```ts
import { z } from 'zod';

const CreateUserSchema = z.object({
  email: z.string().email().max(255).toLowerCase(),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/),
  age: z.number().int().min(13).max(120),
});

// In API handler
app.post('/users', async (req, res) => {
  const result = CreateUserSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ errors: result.error.flatten() });
  }
  const user = await createUser(result.data); // typed and validated
  res.json(user);
});
```

---

## A05 — Security Misconfiguration (Headers)

### Security headers with Helmet (Node/Express)
```ts
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],          // no 'unsafe-inline' in production
      styleSrc: ["'self'", "'unsafe-inline'"],  // acceptable if no CSP nonces
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
}));
```

### Next.js security headers
```ts
// next.config.ts
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];
```

---

## A07 — Authentication

### Session management
```ts
import session from 'express-session';

app.use(session({
  secret: env.SESSION_SECRET,  // 32+ random bytes
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,      // not accessible via JS
    secure: true,        // HTTPS only
    sameSite: 'strict',  // CSRF mitigation
    maxAge: 1000 * 60 * 60 * 24,  // 24h
  },
}));
```

### JWT — if you must use it
```ts
import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(env.JWT_SECRET);

// Sign
const token = await new SignJWT({ sub: user.id, role: user.role })
  .setProtectedHeader({ alg: 'HS256' })
  .setIssuedAt()
  .setExpirationTime('15m')  // short expiry; use refresh tokens
  .sign(secret);

// Verify — always verify!
const { payload } = await jwtVerify(token, secret);
```

### Rate limiting
```ts
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,                      // 5 attempts per window
  message: { error: 'Too many login attempts' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.post('/auth/login', loginLimiter, loginHandler);
```

---

## A10 — SSRF Prevention

```ts
import { isIP } from 'net';

const BLOCKED_CIDRS = ['10.', '192.168.', '172.16.', '127.', '0.', '169.254.'];

function isSafeUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    if (!['http:', 'https:'].includes(url.protocol)) return false;
    if (BLOCKED_CIDRS.some(cidr => url.hostname.startsWith(cidr))) return false;
    if (isIP(url.hostname) !== 0) return false; // block bare IPs
    return true;
  } catch {
    return false;
  }
}

// Allowlist approach (stronger)
const ALLOWED_DOMAINS = new Set(['api.partner.com', 'uploads.cdn.com']);
function isAllowedUrl(urlString: string): boolean {
  const url = new URL(urlString);
  return ALLOWED_DOMAINS.has(url.hostname);
}
```

---

## CORS Configuration

```ts
import cors from 'cors';

const allowedOrigins = ['https://yourapp.com', 'https://www.yourapp.com'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400,  // preflight cache 24h
}));
```

---

## Secure File Uploads

```ts
import { extname } from 'path';
import { createHash } from 'crypto';

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function validateUpload(file: Express.Multer.File): void {
  // 1. Check MIME type (from magic bytes, not extension)
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    throw new Error('File type not allowed');
  }
  // 2. Check size
  if (file.size > MAX_FILE_SIZE) throw new Error('File too large');
  // 3. Sanitize filename — never use original
  const safeFilename = `${createHash('sha256').update(file.buffer).digest('hex')}${extname(file.originalname).toLowerCase()}`;
  // 4. Store outside web root; serve via signed URLs
}
```

---

## Security CI Checklist

Add to every CI pipeline:
```yaml
- name: npm audit
  run: npm audit --audit-level=high

- name: SAST scan
  uses: github/codeql-action/analyze@v3
  with:
    languages: javascript, typescript

- name: Secret scanning
  uses: trufflesecurity/trufflehog@main
```

---

## References
- Read `references/auth-patterns.md` for full OAuth2/OIDC, magic link, passkey implementation patterns
- Read `references/dependency-security.md` for Renovate/Dependabot config, SCA tooling, and supply chain security
