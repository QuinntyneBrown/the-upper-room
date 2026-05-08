---
id: TASK-0075
title: Partner social links sub-form
status: Draft
phase: P
depends_on: [TASK-0073]
traces_to: [L2-034, L2-037]
estimated_context: small
---

# TASK-0075: Partner social links

## Goal
0..n social links: platform enum (Facebook, X, LinkedIn, Instagram, YouTube, TikTok, Other), URL; rendered as platform-icon chips on detail.

## Acceptance Tests

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/partners/partner-social.spec.ts`

**Scenarios:**
1. Add LinkedIn URL `https://linkedin.com/company/x` → detail shows LinkedIn icon chip linking to URL.
2. Invalid URL on save → field error from L2-066 `validation.url`.
3. "Other" platform requires a custom label.
