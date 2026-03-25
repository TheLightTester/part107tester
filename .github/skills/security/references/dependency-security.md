# Dependency Security Reference

## The Problem
Vulnerable dependencies are OWASP A06. The fix: know what you have, update automatically, block on critical issues in CI, and verify what you install.

---

## npm audit — Baseline

```bash
npm audit                          # scan for vulnerabilities
npm audit --audit-level=high       # exit 1 only on high/critical
npm audit fix                      # auto-fix non-breaking
npm audit fix --dry-run            # preview changes
```

### CI integration
```yaml
- name: Dependency audit
  run: npm audit --audit-level=high
```

---

## Renovate — Recommended (more powerful than Dependabot)

Install via [GitHub App](https://github.com/apps/renovate), then add config:

```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": ["config:recommended"],
  "timezone": "America/Los_Angeles",
  "schedule": ["before 9am on Monday"],
  "prConcurrentLimit": 10,
  "labels": ["dependencies"],
  "packageRules": [
    {
      "description": "Auto-merge patch updates",
      "matchUpdateTypes": ["patch"],
      "matchCurrentVersion": "!/^0/",
      "automerge": true,
      "automergeType": "pr",
      "requiredStatusChecks": ["ci"]
    },
    {
      "description": "Group and auto-merge non-major devDeps",
      "matchDepTypes": ["devDependencies"],
      "matchUpdateTypes": ["minor", "patch"],
      "groupName": "devDependencies (non-major)",
      "automerge": true
    },
    {
      "description": "Major updates — manual review required",
      "matchUpdateTypes": ["major"],
      "labels": ["dependencies", "major-update"],
      "automerge": false
    },
    {
      "description": "Security fixes — immediate, any time",
      "isVulnerabilityAlert": true,
      "labels": ["dependencies", "security"],
      "automerge": true,
      "schedule": ["at any time"],
      "prPriority": 10
    },
    {
      "description": "Pin Docker image digests",
      "matchManagers": ["dockerfile"],
      "pinDigests": true
    }
  ],
  "vulnerabilityAlerts": { "enabled": true },
  "osvVulnerabilityAlerts": true
}
```

**Key concepts:**
- `automerge: true` — merges if CI passes (safe for patches/devDeps)
- `schedule` — batch updates to reduce noise
- `osvVulnerabilityAlerts` — uses OSV database in addition to GitHub advisories
- `prPriority: 10` — security PRs jump the queue

---

## Dependabot — GitHub Native (simpler)

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
    open-pull-requests-limit: 10
    groups:
      devDependencies:
        dependency-type: "development"
        update-types: ["minor", "patch"]
      production-minor-patch:
        dependency-type: "production"
        update-types: ["minor", "patch"]
    ignore:
      - dependency-name: "*"
        update-types: ["version-update:semver-major"]

  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
    groups:
      actions:
        patterns: ["*"]

  - package-ecosystem: "docker"
    directory: "/"
    schedule:
      interval: "weekly"
```

### Auto-merge Dependabot PRs
```yaml
# .github/workflows/dependabot-auto-merge.yml
name: Dependabot auto-merge
on: pull_request

permissions:
  contents: write
  pull-requests: write

jobs:
  auto-merge:
    runs-on: ubuntu-latest
    if: github.actor == 'dependabot[bot]'
    steps:
      - uses: dependabot/fetch-metadata@v2
        id: metadata

      - name: Auto-merge patch and minor dev updates
        if: |
          steps.metadata.outputs.update-type == 'version-update:semver-patch' ||
          (steps.metadata.outputs.update-type == 'version-update:semver-minor' &&
           steps.metadata.outputs.dependency-type == 'direct:development')
        run: gh pr merge --auto --squash "$PR_URL"
        env:
          PR_URL: ${{ github.event.pull_request.html_url }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## SCA Tools

### 1. OSV-Scanner (Google) — free, integrates with GitHub
```yaml
# CI
- uses: google/osv-scanner-action@v1
  with:
    scan-args: --lockfile=package-lock.json
```

```bash
# Local
osv-scanner --lockfile=package-lock.json
osv-scanner -r .   # recursive
```

### 2. Snyk — deep DB, license scanning, fix PRs
```bash
npm install -g snyk
snyk auth
snyk test --severity-threshold=high
snyk monitor   # continuous monitoring
```

```yaml
- uses: snyk/actions/node@master
  env:
    SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
  with:
    args: --severity-threshold=high
```

### 3. Socket.dev — supply chain attack detection
Detects: typosquatting, malicious install scripts, dependency confusion, obfuscated code.

```yaml
- uses: nicolo-ribaudo/socket-security-action@v1
  with:
    socket-security-api-key: ${{ secrets.SOCKET_API_KEY }}
```

### 4. License compliance
```bash
npm install -g license-checker
license-checker --onlyAllow 'MIT;Apache-2.0;BSD-2-Clause;BSD-3-Clause;ISC'
license-checker --failOn 'GPL-3.0;AGPL-3.0'
```

---

## Supply Chain Security

### Always commit and use lock files
```bash
npm ci        # uses lockfile exactly — use in CI
# Never: npm install --no-lockfile in production
```

### Pin GitHub Actions to commit SHAs
```yaml
# ❌ Tag can be moved
- uses: actions/checkout@v4

# ✅ Immutable SHA
- uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
```

Use [pin-github-action](https://github.com/mheap/pin-github-action) to automate pinning.

### Subresource Integrity (SRI) for CDN assets
```html
<script
  src="https://cdn.jsdelivr.net/npm/react@18/umd/react.production.min.js"
  integrity="sha384-[base64-hash]"
  crossorigin="anonymous"
></script>
```

Generate hash: `openssl dgst -sha384 -binary file.js | openssl base64 -A`

### Dependency confusion prevention
Attacker publishes a public package with the same name as your private package — npm may install it.

```ini
# .npmrc — lock scoped packages to your private registry
@yourorg:registry=https://your-private-registry.com/
//your-private-registry.com/:_authToken=${PRIVATE_NPM_TOKEN}
# Do NOT add a public fallback for this scope
```

Also: reserve your internal package names on the public npm registry as empty placeholder packages.

### Inspect packages before installing
```bash
npm pack <package>        # download without installing
tar -tf <package>.tgz    # inspect contents first
npm view <package> scripts  # check for suspicious postinstall
```

---

## Full Security CI Pipeline

```yaml
# .github/workflows/security.yml
name: Security

on:
  push:
    branches: [main]
  pull_request:
  schedule:
    - cron: '0 8 * * 1'   # Weekly Monday 8am

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683
      - uses: actions/setup-node@v4
        with: { node-version: '22', cache: 'npm' }
      - run: npm ci
      - run: npm audit --audit-level=high

  osv-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683
      - uses: google/osv-scanner-action@v1
        with:
          scan-args: --lockfile=package-lock.json

  codeql:
    runs-on: ubuntu-latest
    permissions:
      security-events: write
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683
      - uses: github/codeql-action/init@v3
        with: { languages: 'javascript, typescript' }
      - uses: github/codeql-action/analyze@v3

  secret-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683
        with: { fetch-depth: 0 }
      - uses: trufflesecurity/trufflehog@main
        with:
          extra_args: --only-verified
```

---

## Checklist

- [ ] `npm ci` in CI (not `npm install`)
- [ ] Lock file committed and reviewed in PRs
- [ ] `npm audit --audit-level=high` blocks CI on critical/high
- [ ] Renovate or Dependabot configured
- [ ] Patch/minor updates auto-merged when CI passes
- [ ] Major updates require manual review
- [ ] Security vulnerability PRs get priority and merged fast
- [ ] OSV-Scanner or Snyk in CI
- [ ] TruffleHog or GitLeaks secret scanning in CI
- [ ] GitHub Actions pinned to commit SHAs
- [ ] CDN scripts use SRI hashes
- [ ] Private package scopes locked to private registry
- [ ] License policy enforced in CI
