# BUG-011 — Notification preferences page has no digest-frequency control

**Severity**: Low
**Component**: frontend
**Found in test**: TC-11.11 (Notification preferences — digest frequency)
**User-guide refs**: §11.4
**Found**: 2026-05-09

## Description

User guide §11.4 says: *"Pick a digest frequency if available."* No digest-frequency selector is rendered on the notification preferences page.

## Reproduction

1. Sign in.
2. Navigate to `/settings/notifications`.
3. Look for a digest cadence control (None / Daily / Weekly).
4. Observe: only per-event-code Email / Push / In-App toggles are shown.

```bash
grep -nE "digest|Digest|frequency|Frequency|daily|weekly" \
  frontend/projects/domain/src/lib/notifications/notification-preferences/tar-notification-preferences.html \
  frontend/projects/domain/src/lib/notifications/notification-preferences/tar-notification-preferences.ts
# (no matches)
```

## Expected

A select / radio-group for digest frequency (per the conditional "if available" wording, this could be hidden behind a feature flag — but if the user guide documents it, the control should be present at least when the feature flag is on).

## Actual

Component template (`tar-notification-preferences.html`, 56 lines) only renders the per-code toggle table. No digest control.

## Suggested fix

Either:

- Remove the digest frequency line from user guide §11.4 if the feature is descoped, or
- Add a `<tar-select>` with options None / Daily / Weekly, persisting to a `digestFrequency` field on the user's notification preference payload.
