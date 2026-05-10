# BUG-040 — Add to calendar download has no .ics filename (RESOLVED 2026-05-09)

**Severity**: Medium
**Component**: frontend (`projects/the-upper-room/src/app/events/event-detail/event-detail.ts`)
**Found in test**: TC-9.12 (ics.spec.ts:51, :90, :131)
**Found**: 2026-05-09
**Status**: FIXED 2026-05-09 — `addToCalendar()` now derives a slug from the event title and sets `a.download = "{slug}.ics"`, so Chromium honours the extension instead of falling back to the URL last segment + `.txt` (commit `44ba599`).

## Description

`addToCalendar()` creates a download via:

```ts
const a = document.createElement('a');
a.href = `/api/v1/events/${id}/ics`;
a.download = '';
a.click();
```

When `a.download` is set (even to an empty string), Chromium uses the URL's last path segment
as the suggested filename and ignores the server's `Content-Disposition`. The URL ends in `/ics`
so the file is offered as `ics` — and because `text/calendar` has no canonical extension in the
browser's mime registry, it appends `.txt`, yielding `ics.txt`.

The backend (`EventIcsController.cs:41-42`) does the right thing — `File(..., "text/calendar",
"{slug}.ics")` sets `Content-Disposition: attachment; filename="…ics"`. The frontend is
overriding that.

## Reproduction

1. Open `/events/{id}` for any event.
2. Click **Add to calendar**.
3. Inspect the suggested filename — `ics.txt` instead of `{slug}.ics`.

`ics.spec.ts:51, :90, :131` all fail because `download.suggestedFilename()` does not match
`/\.ics$/`.

## Expected

Suggested filename ends with `.ics`. Ideally `{event-slug}.ics` matching the backend response.

## Suggested fix (ATDD)

Set `a.download` to a meaningful filename so that Chromium honours it. The backend
`Content-Disposition` is then redundant but harmless:

```ts
const slug = (this.event()?.title ?? 'event')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');
a.download = `${slug || 'event'}.ics`;
```
