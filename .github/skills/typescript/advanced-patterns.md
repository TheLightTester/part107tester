# Advanced TypeScript Patterns

## Conditional Types

```ts
// Distribute over unions
type IsArray<T> = T extends any[] ? true : false;

// Extract element type
type ElementOf<T> = T extends (infer E)[] ? E : never;

// Deep readonly
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};
```

## Mapped Types

```ts
// Make all methods async
type Asyncify<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => infer R
    ? (...args: A) => Promise<R>
    : T[K];
};

// Nullable version of any interface
type Nullable<T> = { [K in keyof T]: T[K] | null };
```

## Template Literal Types

```ts
type EventName<T extends string> = `on${Capitalize<T>}`;
type ClickHandler = EventName<'click'>; // 'onClick'

// Route params
type ExtractParams<T extends string> =
  T extends `${string}:${infer Param}/${infer Rest}`
    ? Param | ExtractParams<`/${Rest}`>
    : T extends `${string}:${infer Param}`
    ? Param
    : never;

type Params = ExtractParams<'/users/:id/posts/:postId'>; // 'id' | 'postId'
```

## `infer` Keyword

```ts
// Unwrap a Promise
type Awaited<T> = T extends Promise<infer R> ? Awaited<R> : T;

// Get constructor parameters
type ConstructorParams<T> = T extends new (...args: infer P) => any ? P : never;

// Function return type (manual)
type Return<T> = T extends (...args: any[]) => infer R ? R : never;
```

## `satisfies` Operator (TS 4.9+)

```ts
// Validate without widening the type
const palette = {
  red: [255, 0, 0],
  green: '#00ff00',
} satisfies Record<string, string | number[]>;

// palette.red is still number[], not string | number[]
// palette.green is still string
```

## Discriminated Union Exhaustiveness

```ts
function assertNever(x: never): never {
  throw new Error(`Unexpected value: ${JSON.stringify(x)}`);
}

function handleStatus(status: 'a' | 'b' | 'c') {
  switch (status) {
    case 'a': return 1;
    case 'b': return 2;
    case 'c': return 3;
    default: return assertNever(status); // compile error if case missed
  }
}
```

## Builder Pattern with Types

```ts
class QueryBuilder<T extends object, Selected extends keyof T = never> {
  select<K extends keyof T>(key: K): QueryBuilder<T, Selected | K> {
    // implementation
    return this as any;
  }
  build(): Pick<T, Selected> {
    // implementation
    return {} as any;
  }
}
```
