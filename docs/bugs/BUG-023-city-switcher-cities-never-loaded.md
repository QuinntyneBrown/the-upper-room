# BUG-023 — City switcher never fetches city list

| Field | Value |
|---|---|
| ID | BUG-023 |
| Severity | High |
| Status | Fixed |
| Discovered | TC-3.7, TC-3.8 |
| Component | `TarCitySwitcher` |

## Description

The city dropdown never shows any cities to switch to. Only "All cities (read-only)" appears. The `/api/v1/cities` API is never called.

## Root Cause

`TarCitySwitcher.ngOnInit()` checks `this.canSwitch()` before making the HTTP call. At `ngOnInit` time, `MeBootstrap` hasn't yet completed, so permissions aren't loaded, `hasPermission('City:Switch')` returns false, and the call is skipped. `ngOnInit` doesn't re-run after permissions load, so cities are never fetched even when the switcher becomes visible.

## Fix

Replaced `ngOnInit` with a constructor `effect()` that observes `canSwitch()`. The HTTP call fires as soon as `canSwitch()` first becomes true (after permissions load) and is guarded by a `cities().length === 0` check to prevent re-fetching.
