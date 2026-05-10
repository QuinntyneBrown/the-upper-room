# BUG-006 — Partner-create form has no Logo upload field (RESOLVED 2026-05-10)

**Severity**: High
**Component**: frontend
**Found in test**: TC-6.6 (Create partner — Logo upload)
**User-guide refs**: §6.2 ("**Logo** — upload an image if you have one")
**Found**: 2026-05-09
**Status**: FIXED 2026-05-10 — partner-create form now renders a Logo field (`partner-logo-input` file picker → POSTs `/api/v1/uploads`, shows `partner-logo-preview` thumbnail, `partner-logo-clear` removes it). Selected logo URL is included in the create POST so the resulting partner has `logo` populated and the existing partner-detail render path picks it up.

## Description

User guide §6.2 lists Logo upload as one of the fields on the New Partner form. The actual `partner-create` form in the running app has no logo input.

## Reproduction

1. Sign in.
2. Navigate to `/partners/new`.
3. Fill the form: only **Name**, **Website**, and (separately) **Tags** appear. No Logo / image / file input is rendered.
4. Save the partner — the resulting partner has no `logo` value.
5. Open the new partner's detail page (`/partners/:id`) — no logo is displayed.

## Expected

A logo file picker on the New Partner form, with the same upload pipeline used for avatars (`UploadsController`).

## Actual

`frontend/projects/the-upper-room/src/app/partners/partner-create/partner-create.html` — only renders Name, Website, and a tags section. No `<input type="file">`, no `<tar-avatar-uploader>`, no logo control.

The `partner-detail` template *does* render a logo when one exists:

```html
@if (p.logo) {
  <img data-testid="partner-logo" class="partner-header__logo" [src]="p.logo" [alt]="p.name" />
}
```

…so the data path is wired, but no UI lets the user populate `p.logo`.

## Suggested fix

Add an upload control (Material `mat-form-field` wrapper around an `<input type="file">`, or a thumbnail-style dropzone) to `partner-create.html`, posting to the existing `UploadsController` and binding the resulting URL into the create payload. Mirror the field on `partner-edit.html` so existing partners can be updated.
