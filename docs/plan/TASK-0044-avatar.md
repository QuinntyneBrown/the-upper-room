---
id: TASK-0044
title: Avatar component + image upload
status: Accepted
phase: U
depends_on: [TASK-0043]
traces_to: [L2-106]
estimated_context: small
---

# TASK-0044: Avatar component

## Goal
`<tar-avatar [user] [size]>` resolving to image when present or deterministic-color initials. Avatar upload pipeline: client-side crop → upload to `/api/v1/uploads` → server validates type/size, scans, stores; URL set on user.

## Acceptance Tests

### Playwright E2E

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/users/avatar.spec.ts`

**Page Object:** `components/AvatarUploader.ts`.

**Scenarios:**
1. User without `avatarUrl` shows initials at size 48 in a 48px circle with deterministic background color.
2. Upload `valid.png` (300×300, 200KB) → preview appears, save commits, profile reloads showing the image.
3. Upload 6MB JPG → error snackbar from L2-066 `upload.too_large` "File is too large. Max size is 5MB.".
4. Upload PDF → `upload.unsupported_type` error.

## Definition of Done
- [ ] Initials algorithm deterministic across reloads.
