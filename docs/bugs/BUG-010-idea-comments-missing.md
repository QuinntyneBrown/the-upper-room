# BUG-010 — Idea detail page has no comments section (RESOLVED 2026-05-10)

**Severity**: High
**Component**: frontend + backend
**Found in test**: TC-8.8 (Idea discussion)
**User-guide refs**: §8.4
**Found**: 2026-05-09
**Status**: FIXED 2026-05-10 — IdeaCommentRow + GET/POST `/api/v1/ideas/{id}/comments` endpoints (xUnit covered: create + list across restart, 422 on blank body, 404 on unknown idea); idea-detail page now renders the Comments section with list and Post comment composer. TC-8.8 PASS.

## Description

User guide §8.4 says: *"Use the comments area at the bottom to discuss."* The idea detail page renders the cover, title, status chip, vote button, and proposer — but no comment list, no composer, and no comment count. There is also no comments endpoint on `IdeasController`.

## Reproduction

1. Sign in.
2. Open any idea detail page (`/ideas/:id`).
3. Scroll to the bottom of the page.
4. Observe: no comment thread, no "Add a comment" composer, no comment count.

```bash
grep -nE "comment|Comment|reply|Reply" \
  frontend/projects/the-upper-room/src/app/ideas/idea-detail/idea-detail.html
# (no matches in 154 lines)
```

## Expected

A threaded comments area at the bottom of the idea detail page with a composer and a list of existing comments, persisted via a `IdeasController` (or `IdeaCommentsController`) endpoint.

## Actual

No such UI is present and no API endpoint to back it. `IdeasController` exposes the idea CRUD and voting but nothing comment-related.

## Suggested fix

1. Add a comments DbSet/table (`IdeaComment { Id, IdeaId, AuthorId, Body, CreatedAt, EditedAt? }`).
2. Add `GET /api/v1/ideas/{id}/comments`, `POST /api/v1/ideas/{id}/comments`, `PATCH /api/v1/ideas/{id}/comments/{commentId}`, `DELETE …`.
3. Render a comments component below the existing idea body. Reuse `tar-markdown-editor` for the composer and `tar-relative-time` for timestamps.
4. Add author / role-aware delete (author can delete own; SystemAdmin can delete any).
