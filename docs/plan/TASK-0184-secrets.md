---
id: TASK-0184
title: Secrets management
status: Draft
phase: Z
depends_on: [TASK-0001]
traces_to: [L2-095]
estimated_context: small
---

# TASK-0184: Secrets

## Goal
Backend reads secrets from env vars (dev) and Azure Key Vault (prod). Frontend `environment.ts` holds only public config. CI scans for leaked secrets.

## Acceptance Tests

### CI / repo
- `git-secrets` scan runs in CI; fails on any pattern match.
- `dotenv` files are gitignored; sample is `.env.example`.
- Architecture test: any `appsettings.*.json` containing `Secret`/`Password`/`Key` literal triggers a build error in CI (placeholder values must use `${ENV_VAR}` syntax).

## Definition of Done
- [ ] CI scan green on a fresh clone.
