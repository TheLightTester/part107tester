---
name: react
description: >
  Use this skill for any React development task — building components,
  managing state, designing component architecture, hooks, context, data
  fetching, forms, performance optimization, routing, or code reviews of
  React code. Trigger for React 18+, Next.js, Remix, Vite+React, or any
  JSX-based UI work. Also trigger when the user asks about component design,
  prop drilling, lifting state, composition patterns, or rendering strategies
  (SSR, SSG, CSR). Always combine with the `typescript` skill for typed React work.
---

# React Best Practices Skill

## Core Principles
- **Composition over inheritance** — build small, focused components
- **Single responsibility** — one component does one thing well
- **Colocation** — keep related code close (styles, tests, hooks near their component)
- **Derive, don't sync** — compute derived state during render instead of storing it
- **Server-first** — prefer React Server Components where framework supports it

---

## Project Structure

```
src/
├── app/               # Route-level pages (Next.js App Router)
├── components/
│   ├── ui/            # Primitive/design system components (Button, Input)
│   └── features/      # Domain-specific composed components
├── hooks/             # Shared custom hooks
├── lib/               # Pure utilities, API clients
├── stores/            # Global state (Zustand, Jotai, etc.)
└── types/             # Shared TypeScript types
```

Each feature can also be co-located:
```
features/auth/
├── components/
├── hooks/
├── api.ts
└── types.ts
```

---

## Component Patterns

### Prefer named function declarations for components
```tsx
// ✅ Named — shows in React DevTools, stack traces, better HMR
export function UserCard({ user }: { user: User }) { ... }

// ❌ Arrow assigned to const — loses display name
export const UserCard = ({ user }: { user: User }) => { ... }
```

### Default + named exports — default for pages, named for components
```tsx
// Page component → default export (required by Next.js/React Router)
export default function HomePage() { ... }

// Reusable component → named export
export function Avatar({ src, alt }: AvatarProps) { ... }
```

### Container / Presentational split
```tsx
// Presentational — pure, no side effects, easy to test
function UserList({ users, onSelect }: UserListProps) {
  return <ul>{users.map(u => <UserItem key={u.id} user={u} onSelect={onSelect} />)}</ul>;
}

// Container — data fetching, state, business logic
function UserListContainer() {
  const { data: users } = useUsers();
  const handleSelect = useCallback((id: string) => navigate(`/users/${id}`), []);
  return <UserList users={users ?? []} onSelect={handleSelect} />;
}
```

---

## Hooks — Rules & Patterns

### Custom hooks — extract everything beyond primitive state
```tsx
// ❌ Logic mixed into component
function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetchUser(id).then(setUser).finally(() => setLoading(false)) }, [id]);
  // ...
}

// ✅ Clean component, reusable hook
function useUser(id: string) {
  return useQuery({ queryKey: ['user', id], queryFn: () => fetchUser(id) });
}

function ProfilePage({ id }: { id: string }) {
  const { data: user, isLoading } = useUser(id);
  // clean render logic only
}
```

### `useCallback` / `useMemo` — only for real perf needs
```tsx
// Use when: passing to React.memo'd child, stable dep for useEffect
const handleSubmit = useCallback((data: FormData) => {
  onSubmit(data);
}, [onSubmit]);

// Use when: expensive computation or referential stability for objects
const sortedItems = useMemo(
  () => [...items].sort((a, b) => a.name.localeCompare(b.name)),
  [items]
);
```

### `useEffect` — minimal surface, clear cleanup
```tsx
useEffect(() => {
  const controller = new AbortController();
  fetchData(controller.signal).then(setData);
  return () => controller.abort(); // cleanup
}, [id]); // explicit deps — never omit
```

---

## State Management Decision Tree

```
Local UI state (open/closed, input value)
  → useState / useReducer

Shared across nearby components
  → Lift to common parent

Cross-tree or complex state
  → Context (infrequently changing) OR
  → Zustand / Jotai / Recoil (frequently changing)

Server data (fetch, cache, sync)
  → TanStack Query (React Query) or SWR
```

### Context — for infrequently-changing values only
```tsx
// ✅ Good for: theme, locale, auth user, feature flags
const AuthContext = createContext<AuthState | null>(null);

// ❌ Bad for: list of items that updates often (use Zustand instead)
```

---

## Performance Patterns

### React.memo — for expensive pure components
```tsx
const HeavyChart = React.memo(function HeavyChart({ data }: ChartProps) {
  // expensive render
});
// memo does shallow comparison; pass stable references
```

### Code splitting with lazy
```tsx
const HeavyModal = lazy(() => import('./HeavyModal'));

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      {showModal && <HeavyModal />}
    </Suspense>
  );
}
```

### Virtualize long lists
Use `@tanstack/react-virtual` or `react-window` for lists > 100 items.

---

## Forms

Prefer **React Hook Form** with **Zod** validation:
```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type FormData = z.infer<typeof schema>;

function LoginForm({ onSubmit }: { onSubmit: (data: FormData) => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
      <button type="submit">Login</button>
    </form>
  );
}
```

---

## Error Boundaries

```tsx
// Use react-error-boundary package
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div role="alert">
      <p>Something went wrong: {error.message}</p>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

// Wrap at page/feature level
<ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => refetch()}>
  <UserProfile />
</ErrorBoundary>
```

---

## Accessibility Checklist

- Use semantic HTML (`<button>` not `<div onClick>`, `<nav>`, `<main>`, `<article>`)
- Every `<img>` has meaningful `alt` or `alt=""` if decorative
- Form inputs have associated `<label>` (via `htmlFor` or wrapping)
- Interactive elements are keyboard-navigable
- Color is not the only means of conveying info
- Use `aria-label` / `aria-describedby` when native semantics are insufficient

---

## Anti-Patterns

| Anti-pattern | Fix |
|---|---|
| State sync with `useEffect` | Compute derived value during render |
| Props drilling > 2 levels | Extract context or co-locate |
| `key={index}` on reorderable lists | Use stable unique id |
| Mutating state directly | Always return new reference |
| `useEffect` for event subscriptions | Use proper subscription patterns |
| Giant components (>200 lines) | Split into smaller focused components |

---

## References
- Read `references/nextjs.md` for Next.js App Router, RSC, Server Actions, routing patterns
- Read `references/data-fetching.md` for TanStack Query, SWR, and RSC data patterns
