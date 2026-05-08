---
id: TASK-0189
title: Reduced-motion support pass
status: Draft
phase: Z
depends_on: [TASK-0002]
traces_to: [L2-006]
estimated_context: small
---

# TASK-0189: Reduced motion

## Goal
`prefers-reduced-motion: reduce` collapses every transition to `0ms`/`linear` and disables non-essential animation (route transitions, drawer slide, skeleton shimmer, snackbar slide-in, idea heart bump).

## Acceptance Tests

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/hardening/reduced-motion.spec.ts`

**Scenarios (with `page.emulateMedia({ reducedMotion: 'reduce' })`):**
1. Drawer opens instantly (no animation visible in slow-motion recording).
2. Skeleton element has no shimmer animation property.
3. Snackbar appears instantly.
4. Idea heart click does NOT play scale animation.

## Definition of Done
- [ ] No essential motion is also disabled (e.g., a loading spinner still spins, but slowed).
