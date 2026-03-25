---
name: software-testing
description: >
  Use this skill whenever writing, reviewing, or planning tests of ANY kind
  for web applications. Triggers include: unit tests, integration tests,
  end-to-end tests, performance tests, UI/component tests, test coverage,
  mocking, test architecture, CI test pipelines, snapshot tests, or any
  request with words like "test", "spec", "vitest", "jest", "playwright",
  "cypress", "testing library", "coverage", "mock", "stub", or "fixture".
  Also trigger when a user asks how to make code more testable, or when
  reviewing code that lacks tests. Always use this alongside the `react` or
  `typescript` skills when testing front-end code.
---

# Software Testing Best Practices Skill

## Testing Philosophy
- **Test behavior, not implementation** — tests should survive refactors
- **Arrange / Act / Assert** — every test has a clear structure
- **One logical assertion per test** — multiple `expect` calls are fine if they validate one behavior
- **Tests as documentation** — test names describe what the system does, not how
- **Fast feedback** — unit tests run in milliseconds, integration in seconds

---

## Testing Pyramid

```
         /\
        /E2E\        Playwright / Cypress — few, slow, high confidence
       /------\
      /  Integ  \    Vitest + MSW / Supertest — moderate, real connections
     /------------\
    /     Unit      \   Vitest / Jest — many, fast, isolated
   /------------------\
```

Typical ratios: **~70% unit / ~20% integration / ~10% E2E**

---

## Tool Recommendations

| Layer | Recommended Tool | Notes |
|-------|-----------------|-------|
| Unit + Integration | **Vitest** | Fast, ESM-native, Vite-compatible |
| React components | **React Testing Library (RTL)** | User-centric queries |
| E2E | **Playwright** | Cross-browser, auto-wait, trace viewer |
| API mocking | **MSW (Mock Service Worker)** | Works in both browser and Node |
| Snapshot | Vitest inline snapshots | Prefer explicit assertions |
| Performance | **k6** or **Lighthouse CI** | See references/performance.md |

---

## Unit Tests — Patterns

### Basic test structure
```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('formatCurrency', () => {
  it('formats positive USD amounts', () => {
    expect(formatCurrency(1234.5, 'USD')).toBe('$1,234.50');
  });

  it('handles zero', () => {
    expect(formatCurrency(0, 'USD')).toBe('$0.00');
  });

  it('throws for unsupported currencies', () => {
    expect(() => formatCurrency(100, 'XXX')).toThrow('Unsupported currency');
  });
});
```

### Mocking
```ts
// Mock a module
vi.mock('../api/users', () => ({
  fetchUser: vi.fn().mockResolvedValue({ id: '1', name: 'Alice' }),
}));

// Spy on existing module method
const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

// Reset between tests
beforeEach(() => vi.clearAllMocks());
```

### Testing async code
```ts
it('resolves with user data on success', async () => {
  const user = await getUser('1');
  expect(user).toEqual({ id: '1', name: 'Alice' });
});

it('throws on 404', async () => {
  await expect(getUser('missing')).rejects.toThrow('User not found');
});
```

---

## React Component Tests (RTL)

### Core principles
- Query by **role, label, text** — not class names or IDs
- Interact as a **user would** (`userEvent` not `fireEvent`)
- Test what the **user sees**, not internal state

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('LoginForm', () => {
  it('shows validation error for invalid email', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={vi.fn()} />);

    await user.type(screen.getByLabelText(/email/i), 'not-an-email');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(/valid email/i);
  });

  it('calls onSubmit with credentials on valid input', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<LoginForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/email/i), 'alice@example.com');
    await user.type(screen.getByLabelText(/password/i), 'secret123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      email: 'alice@example.com',
      password: 'secret123',
    });
  });
});
```

### RTL Query Priority
1. `getByRole` — most accessible, tests ARIA semantics
2. `getByLabelText` — form inputs
3. `getByPlaceholderText` — avoid if label available
4. `getByText` — for non-interactive text
5. `getByTestId` — **last resort only**, brittle

---

## Integration Tests

### API routes with MSW
```ts
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

const server = setupServer(
  http.get('/api/users/:id', ({ params }) => {
    return HttpResponse.json({ id: params.id, name: 'Alice' });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

it('renders user profile from API', async () => {
  render(<UserProfile id="1" />);
  expect(await screen.findByText('Alice')).toBeInTheDocument();
});
```

### Database integration tests
```ts
// Use real DB in a test container or in-memory DB
import { createTestDatabase, cleanDatabase } from '../test-utils/db';

let db: TestDatabase;

beforeAll(async () => { db = await createTestDatabase(); });
afterEach(async () => { await cleanDatabase(db); });
afterAll(async () => { await db.close(); });

it('saves and retrieves a user', async () => {
  const repo = new UserRepository(db);
  const saved = await repo.save({ email: 'test@example.com' });
  const found = await repo.findById(saved.id);
  expect(found?.email).toBe('test@example.com');
});
```

---

## E2E Tests (Playwright)

```ts
import { test, expect } from '@playwright/test';

test.describe('Authentication flow', () => {
  test('user can log in and see dashboard', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Email').fill('user@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByRole('heading', { name: /welcome/i })).toBeVisible();
  });

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('wrong@example.com');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page.getByRole('alert')).toContainText('Invalid credentials');
  });
});
```

### Playwright best practices
- Use `page.getByRole()` / `getByLabel()` over CSS selectors
- Use `test.use({ storageState: 'auth.json' })` to skip login in tests that don't test auth
- Parallelise with `test.describe.parallel()`
- Use `expect(locator).toBeVisible()` not `isVisible()` — auto-waits

---

## Test Coverage

### vitest.config.ts coverage setup
```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
      exclude: ['**/*.stories.tsx', '**/index.ts', '**/*.d.ts'],
    },
  },
});
```

**Coverage targets by layer:**
- Business logic / utilities: **90%+**
- React components: **80%+**
- API handlers: **85%+**
- Overall: **80% lines** as a floor

---

## Test File Conventions

```
src/
├── components/
│   ├── Button.tsx
│   ├── Button.test.tsx       ← co-located unit/component test
│   └── Button.stories.tsx    ← Storybook (visual tests)
├── lib/
│   ├── format.ts
│   └── format.test.ts
└── __tests__/
    └── integration/          ← integration tests separate
```

---

## Common Anti-Patterns

| Anti-pattern | Fix |
|---|---|
| Testing implementation details | Test user-visible behavior |
| `getByTestId` everywhere | Use semantic queries first |
| Large `beforeAll` state | Use `beforeEach` for isolation |
| Testing third-party libraries | Mock them; test your code |
| Flaky async tests with `sleep()` | Use `waitFor()` or `.findBy*()` |
| `it('should work')` | Describe behavior: `it('returns null when user is not found')` |

---

## References
- Read `references/performance-testing.md` for k6 load testing, Lighthouse CI, Web Vitals
- Read `references/test-architecture.md` for test doubles taxonomy, factories, and large-scale test organization
