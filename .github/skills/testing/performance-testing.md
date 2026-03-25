# Performance Testing Reference

## Web Vitals Targets

| Metric | Good | Needs Work | Poor |
|--------|------|-----------|------|
| LCP (Largest Contentful Paint) | ≤ 2.5s | ≤ 4s | > 4s |
| INP (Interaction to Next Paint) | ≤ 200ms | ≤ 500ms | > 500ms |
| CLS (Cumulative Layout Shift) | ≤ 0.1 | ≤ 0.25 | > 0.25 |
| TTFB (Time to First Byte) | ≤ 800ms | ≤ 1800ms | > 1800ms |

## Lighthouse CI

```yaml
# .github/workflows/lighthouse.yml
- name: Run Lighthouse CI
  uses: treosh/lighthouse-ci-action@v10
  with:
    urls: |
      http://localhost:3000/
      http://localhost:3000/about
    budgetPath: ./budget.json
    uploadArtifacts: true
```

```json
// budget.json
[{
  "path": "/*",
  "timings": [
    { "metric": "interactive", "budget": 5000 },
    { "metric": "first-contentful-paint", "budget": 2000 }
  ],
  "resourceSizes": [
    { "resourceType": "script", "budget": 300 },
    { "resourceType": "total", "budget": 600 }
  ]
}]
```

## k6 Load Testing

```js
// load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '1m', target: 50 },   // ramp up
    { duration: '3m', target: 50 },   // hold
    { duration: '1m', target: 0 },    // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% under 500ms
    errors: ['rate<0.01'],             // <1% error rate
  },
};

export default function () {
  const res = http.get('https://yourapp.com/api/data');
  check(res, {
    'status 200': (r) => r.status === 200,
    'duration < 500ms': (r) => r.timings.duration < 500,
  });
  errorRate.add(res.status !== 200);
  sleep(1);
}
```

Run: `k6 run load-test.js`

## React Performance Testing

```tsx
// Measure render time with React Profiler
import { Profiler } from 'react';

function onRenderCallback(
  id: string,
  phase: 'mount' | 'update',
  actualDuration: number
) {
  if (actualDuration > 16) { // > 1 frame at 60fps
    console.warn(`Slow render: ${id} took ${actualDuration}ms`);
  }
}

<Profiler id="UserList" onRender={onRenderCallback}>
  <UserList items={items} />
</Profiler>
```

## Bundle Size Testing

```json
// package.json script
"analyze": "ANALYZE=true next build"
```

Use `@next/bundle-analyzer` or `rollup-plugin-visualizer` to identify large dependencies.

Set size budgets in CI:
```js
// size-limit.config.js
module.exports = [
  { path: 'dist/index.js', limit: '50 KB' },
  { path: 'dist/vendor.js', limit: '200 KB' },
];
```
