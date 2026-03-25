---
name: typescript
description: >
  Apply this skill for ANY TypeScript work — new files, refactoring JS to TS,
  type design, generics, utility types, strict config, module patterns, or
  reviewing TS code for type safety issues. Use it whenever the user mentions
  TypeScript, `.ts`, `.tsx`, strict typing, type errors, or asks to "add types"
  to existing code. Also trigger when building React + TypeScript projects,
  Next.js, or any Node/backend TS service.
---

# TypeScript Best Practices Skill

## Core Philosophy
- **Strict mode always** — `"strict": true` in tsconfig is non-negotiable
- **Types as documentation** — write types that make intent obvious
- **Avoid `any`** — use `unknown`, generics, or proper unions instead
- **Prefer inference** — let TS infer where it's clear; annotate at boundaries

---

## tsconfig.json — Recommended Baseline

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

Key flags to explain when asked:
- `noUncheckedIndexedAccess` — array[i] returns `T | undefined`, forcing null checks
- `exactOptionalPropertyTypes` — `{ a?: string }` forbids explicitly passing `undefined`
- `isolatedModules` — ensures each file can be transpiled independently (Vite/esbuild safe)

---

## Type Design Patterns

### Prefer `interface` for object shapes, `type` for unions/intersections
```ts
// ✅ Object shape → interface (extendable, better error messages)
interface User {
  id: string;
  email: string;
  role: 'admin' | 'viewer';
}

// ✅ Unions, mapped types, conditional types → type alias
type ApiResponse<T> = { data: T; status: number } | { error: string; status: number };
```

### Discriminated unions over boolean flags
```ts
// ❌ Brittle — flags can be in illegal states
interface Request { loading: boolean; data?: User; error?: Error }

// ✅ Exhaustive and safe
type Request =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: User }
  | { status: 'error'; error: Error };
```

### `unknown` not `any` for external data
```ts
async function fetchUser(id: string): Promise<User> {
  const res = await fetch(`/api/users/${id}`);
  const json: unknown = await res.json();
  return parseUser(json); // validate/parse before trusting
}
```

### Const assertions for literal inference
```ts
const ROUTES = ['/', '/about', '/contact'] as const;
type Route = typeof ROUTES[number]; // '/' | '/about' | '/contact'
```

---

## Generics — Guidelines

- Constrain with `extends` when you need properties: `<T extends { id: string }>`
- Use default generics for optional flexibility: `<T = unknown>`
- Prefer readable names: `TItem`, `TKey`, `TValue` over single letters in complex code

```ts
// Generic repository pattern
interface Repository<TEntity extends { id: string }> {
  findById(id: string): Promise<TEntity | null>;
  save(entity: TEntity): Promise<TEntity>;
  delete(id: string): Promise<void>;
}
```

---

## Utility Types — Cheat Sheet

| Utility | Use case |
|---------|----------|
| `Partial<T>` | All props optional (update payloads) |
| `Required<T>` | All props required |
| `Readonly<T>` | Immutable — use for config objects |
| `Pick<T, K>` | Subset of props |
| `Omit<T, K>` | All props except K |
| `Record<K, V>` | Typed dictionaries |
| `ReturnType<F>` | Infer return type of a function |
| `Awaited<T>` | Unwrap Promise type |
| `NonNullable<T>` | Remove null/undefined |
| `Parameters<F>` | Function argument tuple |

---

## Async Patterns

```ts
// Always type rejection paths — use Result type for expected errors
type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

async function safeParseJson<T>(text: string): Promise<Result<T>> {
  try {
    return { ok: true, value: JSON.parse(text) as T };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e : new Error(String(e)) };
  }
}
```

---

## Module Patterns

### Barrel exports — use sparingly
```ts
// src/features/auth/index.ts — export only public API
export { AuthProvider } from './AuthProvider';
export type { AuthState, AuthUser } from './types';
// Do NOT re-export internal helpers
```

### Path aliases (tsconfig + bundler)
```json
// tsconfig.json
"paths": { "@/*": ["./src/*"] }
```

---

## Anti-Patterns to Avoid

| Anti-pattern | Fix |
|---|---|
| `as any` | Use `unknown` + type guard or `satisfies` |
| `// @ts-ignore` | Fix the type; use `@ts-expect-error` with a comment if truly needed |
| `!` non-null assertion on user input | Add a runtime check |
| `Object.keys(obj)` returning `string[]` | Cast with `(Object.keys(obj) as Array<keyof typeof obj>)` or use a typed helper |
| Widening `enum` values | Prefer `as const` objects over enums |

---

## Enums → Prefer `as const` Objects

```ts
// ❌ Enums have runtime footprint and merge oddities
enum Direction { Up, Down }

// ✅ Same semantics, no runtime overhead, works with union types
const Direction = { Up: 'Up', Down: 'Down' } as const;
type Direction = typeof Direction[keyof typeof Direction];
```

---

## Type Guards & Narrowing

```ts
// User-defined type guard
function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' && value !== null &&
    'id' in value && typeof (value as User).id === 'string'
  );
}

// Assertion function (throws if invalid)
function assertUser(value: unknown): asserts value is User {
  if (!isUser(value)) throw new TypeError(`Expected User, got ${JSON.stringify(value)}`);
}
```

---

## References
- Read `references/advanced-patterns.md` for: conditional types, mapped types, template literal types, `infer`, `satisfies` operator
- Read `references/react-typescript.md` when working with React + TypeScript (component props, hooks, event types, forwardRef, generic components)
