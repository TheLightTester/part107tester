# Next.js App Router Reference

## App Router vs Pages Router

Always use **App Router** (`app/`) for new projects. Pages Router is legacy.

```
app/
├── layout.tsx          # Root layout — wraps all pages, never remounts
├── page.tsx            # Route: /
├── loading.tsx         # Automatic Suspense boundary for the route
├── error.tsx           # Error boundary for the route
├── not-found.tsx       # 404 for the route segment
├── (marketing)/        # Route group — no URL segment
│   ├── about/page.tsx  # Route: /about
│   └── blog/page.tsx   # Route: /blog
├── dashboard/
│   ├── layout.tsx      # Nested layout — wraps dashboard/* only
│   ├── page.tsx        # Route: /dashboard
│   └── settings/
│       └── page.tsx    # Route: /dashboard/settings
└── api/
    └── users/
        └── route.ts    # API route: GET/POST /api/users
```

---

## React Server Components (RSC)

### The mental model
- **Server Components** (default) — render on server, zero JS sent to client, can `await` directly
- **Client Components** (`'use client'`) — interactive, use hooks, run in browser

```
Server Component               Client Component
─────────────────────          ─────────────────────
async/await ✅                 useState / useEffect ✅
DB / filesystem access ✅      browser APIs ✅
No hooks ❌                    No direct DB access ❌
No event handlers ❌           Smaller payload ❌ (adds JS)
```

### Default to Server Components
```tsx
// app/users/page.tsx — Server Component (no directive needed)
import { db } from '@/lib/db';

export default async function UsersPage() {
  const users = await db.users.findMany(); // direct DB access ✅

  return (
    <ul>
      {users.map(u => <li key={u.id}>{u.name}</li>)}
    </ul>
  );
}
```

### Client Components — mark explicitly
```tsx
'use client'; // ← must be first line

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

### Composition pattern — push `'use client'` to the leaves
```tsx
// ✅ Page is a Server Component; only the interactive part is a Client Component
// app/dashboard/page.tsx (Server)
import { UserTable } from './UserTable';        // Server Component
import { SearchBar } from './SearchBar';        // Client Component

export default async function DashboardPage() {
  const users = await db.users.findMany();
  return (
    <>
      <SearchBar />           {/* Client — has interactivity */}
      <UserTable users={users} />  {/* Server — just renders data */}
    </>
  );
}
```

### Passing Server data to Client Components
```tsx
// Server fetches, passes serializable props to client
// ❌ Cannot pass functions, class instances, or non-serializable values as props
// ✅ Can pass: strings, numbers, plain objects, arrays, Date (auto-serialized)

export default async function Page() {
  const config = await getConfig(); // server-only fetch
  return <ClientWidget config={config} />; // pass plain data
}
```

---

## Routing Patterns

### Dynamic routes
```
app/
├── users/[id]/page.tsx         # /users/123
├── blog/[...slug]/page.tsx     # /blog/a/b/c (catch-all)
└── shop/[[...filters]]/page.tsx # /shop OR /shop/a/b (optional catch-all)
```

```tsx
// app/users/[id]/page.tsx
interface Props {
  params: Promise<{ id: string }>;         // Next.js 15 — params is a Promise
  searchParams: Promise<{ tab?: string }>; // query string
}

export default async function UserPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { tab } = await searchParams;
  const user = await db.users.findById(id);
  // ...
}
```

### Route groups
```
app/
├── (auth)/          # Groups auth pages under a shared layout
│   ├── layout.tsx   # Auth layout (centered card, no nav)
│   ├── login/
│   └── signup/
└── (app)/           # Groups app pages under a different layout
    ├── layout.tsx   # App layout (sidebar nav)
    └── dashboard/
```

### Parallel routes
```
app/dashboard/
├── @analytics/page.tsx   # Slot: shown alongside main content
├── @team/page.tsx        # Slot: shown alongside main content
└── layout.tsx            # Receives @analytics and @team as props
```

```tsx
// app/dashboard/layout.tsx
export default function Layout({
  children,
  analytics,
  team,
}: {
  children: React.ReactNode;
  analytics: React.ReactNode;
  team: React.ReactNode;
}) {
  return (
    <div>
      {children}
      <aside>{analytics}</aside>
      <aside>{team}</aside>
    </div>
  );
}
```

### Intercepting routes
```
app/
├── photos/[id]/page.tsx       # Full page: /photos/123
└── @modal/(.)photos/[id]/    # Intercepts same-level /photos/123 → shows modal
    └── page.tsx
```

---

## Server Actions

Server Actions are async functions that run on the server, called from Client Components (forms, event handlers).

```tsx
// app/actions/users.ts
'use server'; // marks all exports as Server Actions

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const CreateUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export async function createUser(formData: FormData) {
  const result = CreateUserSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
  });

  if (!result.success) {
    return { error: result.error.flatten() };
  }

  await db.users.create({ data: result.data });
  revalidatePath('/users');      // revalidate cached page
  // redirect('/users');         // or redirect
}
```

```tsx
// Client Component using Server Action
'use client';

import { useActionState } from 'react';
import { createUser } from '@/app/actions/users';

export function CreateUserForm() {
  const [state, action, isPending] = useActionState(createUser, null);

  return (
    <form action={action}>
      <input name="name" required />
      <input name="email" type="email" required />
      {state?.error && <p>{JSON.stringify(state.error)}</p>}
      <button type="submit" disabled={isPending}>
        {isPending ? 'Creating...' : 'Create User'}
      </button>
    </form>
  );
}
```

### Server Actions — security rules
- **Always validate input** — treat form data like untrusted user input (use Zod)
- **Always check auth** — Server Actions are POST endpoints; anyone can call them
- **Never expose secrets** — the `'use server'` boundary is not automatic auth

```tsx
'use server';

import { getSession } from '@/lib/auth';

export async function deletePost(postId: string) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  // Verify ownership before deleting
  const post = await db.posts.findUnique({ where: { id: postId } });
  if (post?.authorId !== session.user.id) throw new Error('Forbidden');

  await db.posts.delete({ where: { id: postId } });
  revalidatePath('/posts');
}
```

---

## Metadata & SEO

```tsx
// Static metadata
export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Your personal dashboard',
};

// Dynamic metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const post = await getPost(id);
  return {
    title: post.title,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [{ url: post.coverImage }],
    },
  };
}
```

---

## Caching & Revalidation

```tsx
// fetch() is extended with caching options
const data = await fetch('https://api.example.com/data', {
  cache: 'force-cache',          // Static — cache indefinitely (default in Next 14)
  next: { revalidate: 3600 },    // ISR — revalidate every hour
  cache: 'no-store',             // Dynamic — never cache
});

// Revalidate on-demand (from Server Action or Route Handler)
import { revalidatePath, revalidateTag } from 'next/cache';

revalidatePath('/blog');         // revalidate a specific path
revalidateTag('posts');          // revalidate all fetches tagged 'posts'

// Tag fetches for targeted revalidation
const posts = await fetch('/api/posts', { next: { tags: ['posts'] } });
```

---

## Route Handlers (API Routes)

```tsx
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const page = Number(searchParams.get('page') ?? '1');

  const users = await db.users.findMany({ skip: (page - 1) * 20, take: 20 });
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  // validate body...
  const user = await db.users.create({ data: body });
  return NextResponse.json(user, { status: 201 });
}
```

```tsx
// app/api/users/[id]/route.ts — dynamic segment
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await db.users.findById(id);
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(user);
}
```

---

## Middleware

```ts
// middleware.ts (root of project)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('session')?.value;

  // Redirect unauthenticated users
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*'],
};
```

---

## `loading.tsx` and `error.tsx`

```tsx
// app/dashboard/loading.tsx — shown while page.tsx is fetching
export default function Loading() {
  return <DashboardSkeleton />;
}

// app/dashboard/error.tsx — catches runtime errors in segment
'use client'; // error boundaries must be client components

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

---

## generateStaticParams (SSG)

```tsx
// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await db.posts.findMany({ select: { slug: true } });
  return posts.map(post => ({ slug: post.slug }));
}
// Next.js will pre-render all returned param combinations at build time
```
