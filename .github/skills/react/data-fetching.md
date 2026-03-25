# Data Fetching Reference

## Decision Tree

```
Where does the component live?
│
├── Server Component (RSC)?
│   └── fetch/await directly → no library needed
│
└── Client Component?
    ├── Needs caching, background refetch, optimistic updates?
    │   └── TanStack Query (React Query) ← recommended default
    ├── Simple SWR-style fetching, small bundle priority?
    │   └── SWR
    └── Simple one-off fetch, no caching?
        └── useEffect + useState (sparingly)
```

---

## RSC Data Fetching (Server Components)

### Direct async/await — the simplest pattern
```tsx
// app/users/page.tsx
export default async function UsersPage() {
  const users = await db.users.findMany();   // direct DB
  // or:
  const res = await fetch('https://api.example.com/users', {
    next: { revalidate: 60 },  // cache for 60s
  });
  const users = await res.json();

  return <UserList users={users} />;
}
```

### Parallel fetching — avoid waterfall
```tsx
// ❌ Sequential — slow (each awaits before starting next)
const user = await getUser(id);
const posts = await getPosts(id);

// ✅ Parallel — both start simultaneously
const [user, posts] = await Promise.all([
  getUser(id),
  getPosts(id),
]);
```

### Streaming with Suspense
```tsx
// app/dashboard/page.tsx
import { Suspense } from 'react';

export default function DashboardPage() {
  return (
    <>
      <Suspense fallback={<StatsSkeleton />}>
        <Stats />      {/* Streams in when ready */}
      </Suspense>
      <Suspense fallback={<FeedSkeleton />}>
        <Feed />       {/* Streams in independently */}
      </Suspense>
    </>
  );
}

// Each component fetches its own data
async function Stats() {
  const stats = await getStats();  // slow query — doesn't block Feed
  return <StatsChart data={stats} />;
}
```

### `cache()` — deduplicate fetches across a request
```ts
// lib/data.ts
import { cache } from 'react';

// Calling getUser(id) multiple times in one render only hits DB once
export const getUser = cache(async (id: string) => {
  return db.users.findUnique({ where: { id } });
});
```

---

## TanStack Query (React Query)

### Setup
```tsx
// app/providers.tsx
'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,     // 1 minute before refetch
        gcTime: 10 * 60 * 1000,   // 10 minutes before garbage collected
        retry: 2,
        refetchOnWindowFocus: true,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}
```

### Query hooks — pattern
```ts
// lib/queries/users.ts — co-locate query keys and fetchers
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: UserFilters) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

export function useUsers(filters: UserFilters) {
  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn: () => fetchUsers(filters),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => fetchUser(id),
    enabled: !!id,           // don't fetch if id is empty
  });
}
```

### Mutations
```ts
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserInput) => createUser(data),

    // Optimistic update
    onMutate: async (newUser) => {
      await queryClient.cancelQueries({ queryKey: userKeys.lists() });
      const previous = queryClient.getQueryData(userKeys.lists());

      queryClient.setQueryData(userKeys.lists(), (old: User[]) => [
        ...old,
        { ...newUser, id: 'temp', createdAt: new Date() },
      ]);

      return { previous };
    },

    onError: (err, newUser, context) => {
      // Rollback on error
      queryClient.setQueryData(userKeys.lists(), context?.previous);
    },

    onSettled: () => {
      // Always refetch after mutation
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}
```

### Pagination
```ts
export function useUsersPaginated(page: number) {
  return useQuery({
    queryKey: userKeys.list({ page }),
    queryFn: () => fetchUsers({ page }),
    placeholderData: keepPreviousData,  // no flicker between pages
  });
}

// Infinite scroll
export function useUsersInfinite() {
  return useInfiniteQuery({
    queryKey: userKeys.lists(),
    queryFn: ({ pageParam }) => fetchUsers({ cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}
```

### Prefetching (Server Component + TanStack Query hybrid)
```tsx
// app/users/page.tsx — prefetch on server, hydrate on client
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';

export default async function UsersPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: userKeys.lists(),
    queryFn: fetchUsers,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UserListClient />  {/* Client Component — data is pre-populated */}
    </HydrationBoundary>
  );
}
```

### Error and loading states
```tsx
function UserProfile({ id }: { id: string }) {
  const { data: user, isLoading, isError, error } = useUser(id);

  if (isLoading) return <Skeleton />;
  if (isError) return <ErrorMessage error={error} />;
  if (!user) return <NotFound />;

  return <Profile user={user} />;
}
```

---

## SWR

Good fit for: simpler apps, smaller bundle, when you don't need TanStack Query's mutation features.

### Basic usage
```tsx
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

function UserProfile({ id }: { id: string }) {
  const { data, error, isLoading, mutate } = useSWR<User>(
    id ? `/api/users/${id}` : null,  // null → don't fetch
    fetcher,
    {
      revalidateOnFocus: true,
      dedupingInterval: 60_000,
    }
  );

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage />;
  return <Profile user={data!} />;
}
```

### Mutation with SWR
```tsx
async function updateUser(id: string, data: Partial<User>) {
  await fetch(`/api/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  // Trigger revalidation
  mutate(`/api/users/${id}`);
}
```

### Global SWR config
```tsx
// app/providers.tsx
import { SWRConfig } from 'swr';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher: (url: string) => fetch(url).then(r => {
          if (!r.ok) throw new Error('API error');
          return r.json();
        }),
        revalidateOnFocus: false,
        shouldRetryOnError: true,
        errorRetryCount: 3,
      }}
    >
      {children}
    </SWRConfig>
  );
}
```

---

## API Client Pattern

Centralize fetch logic — don't scatter `fetch` calls across components.

```ts
// lib/api/client.ts
class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(res.status, error.message);
  }

  return res.json() as T;
}

export const api = {
  users: {
    list: (filters?: UserFilters) =>
      request<User[]>(`/users?${new URLSearchParams(filters as any)}`),
    get: (id: string) =>
      request<User>(`/users/${id}`),
    create: (data: CreateUserInput) =>
      request<User>('/users', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<User>) =>
      request<User>(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<void>(`/users/${id}`, { method: 'DELETE' }),
  },
};
```

---

## Patterns to Avoid

| Anti-pattern | Problem | Fix |
|---|---|---|
| `useEffect` + `useState` for fetching | No caching, no dedup, race conditions | Use TanStack Query or SWR |
| Fetching in every leaf component | Waterfall, duplicate requests | Fetch at route level, pass as props or use `cache()` |
| Not handling loading/error states | Bad UX, crashes | Always handle `isLoading` + `isError` |
| Storing server data in Zustand/Context | Double source of truth | TanStack Query IS the cache for server data |
| `mutate()` then navigate immediately | Stale data on next page | `await mutate()` or `invalidateQueries` before navigating |
