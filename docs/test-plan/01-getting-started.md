# Section 1 — Getting Started

> Mirrors `docs/user-guide.md` §1.

## Pre-conditions

- Backend and frontend running per `00-overview.md`.
- A clean browser profile (no cached cookies, no `localStorage` for the host).

## Tests

### TC-1.1 — App loads on the public landing page

**Steps**

1. Navigate to `http://localhost:4200/` in a clean browser.

**UI verification**

- Component: `frontend/projects/the-upper-room/src/app/landing/landing.html:1` renders `<main class="landing">`.
- Heading visible: **"The Upper Room"** (`landing.html:2`, `<h1 class="landing__title">`).
- Page `<title>` is **"The Upper Room"** (`frontend/projects/the-upper-room/src/index.html:5`).
- Favicon loads from `favicon.ico` (`index.html:8`).
- Manifest link present: `manifest.webmanifest` (`index.html:9`).
- Body contains `<app-root>` (`index.html:80`) which mounts `frontend/projects/the-upper-room/src/app/app.html` — verify presence of `<tar-snackbar />`, `<tar-confirm-dialog />`, `<app-inactivity-dialog />`, `<app-error-boundary />` (`app.html:2-5`).

**Behavior verification**

- Service worker registers: in DevTools › Application › Service Workers, `/sw.js` is "activated and is running" (`index.html:82-84`).
- No console errors.

**Database verification**

- N/A (read-only landing).

**Pass criteria**: heading and title match; service worker registers; no console errors.

**Severity if failing**: High.

---

### TC-1.2 — Roboto font loads from Google Fonts

**Steps**

1. Open DevTools › Network, filter by `Font`.
2. Hard-refresh the landing page (Ctrl+F5).

**UI verification**

- Network shows requests to `https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500&display=swap` (`index.html:73-76`) returning `200`.
- Network shows `https://fonts.gstatic.com/...` Roboto woff2 file(s) returning `200`.
- DevTools › Elements › Computed on the landing `<h1>` shows `font-family` resolving to `Roboto` (per `--md-sys-typescale-headline-large` in `_tokens.scss:113`).
- Preconnect hints `<link rel="preconnect" href="https://fonts.googleapis.com">` and `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>` are present (`index.html:71-72`).

**Behavior verification**

- CSP allows the font origins: response `Content-Security-Policy` header includes `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com` and `font-src 'self' https://fonts.gstatic.com` (`backend/src/TheUpperRoom.Api/Program.cs:46-48`).

**Database verification**: N/A.

**Pass criteria**: CSS file and at least one woff2 load with status `200`; computed `font-family` includes `Roboto`.

**Severity if failing**: High.

---

### TC-1.3 — Material Symbols Rounded font loads

**Steps**

1. With Network filtered by `Font`, hard-refresh.

**UI verification**

- Network shows `https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap` (`index.html:11-13`) returning `200`.
- A page that uses `<span class="material-symbols-outlined">…</span>` (e.g. dashboard at `frontend/projects/the-upper-room/src/app/dashboard/dashboard.html:10`) renders glyphs as icons, not as text.

**Pass criteria**: stylesheet resolves and any subsequent `material-symbols-outlined` span renders a glyph.

**Severity if failing**: Medium.

---

### TC-1.4 — Theme initializes to system preference (no FOUC)

**Steps**

1. In OS settings set color scheme to **Dark**.
2. Open `http://localhost:4200/` in a fresh window (no `localStorage.theme`).

**UI verification**

- The `<html>` element gains `data-theme="dark"` before first paint (synchronous script at `index.html:57-70`).
- Background color resolves to `--md-sys-color-background: #1c1b1f` (dark override, `_tokens.scss:144`).
- No light-to-dark flash.

**Repeat with**

- OS set to **Light**: `<html>` has no `data-theme` attribute (or `light`); background resolves to `#fffbfe` (`_tokens.scss:27`).
- `localStorage.theme = 'light'` while OS is dark: forced light. The CSS rule `:root:not([data-theme='light'])` (`_tokens.scss:163`) ensures user preference wins.

**Pass criteria**: theme matches expected source (localStorage > OS); no FOUC.

**Severity if failing**: Medium.

---

### TC-1.5 — Supported browser banner does not show on modern browsers

**Steps**

1. Visit landing in latest Chrome / Edge / Firefox / Safari.

**UI verification**

- `#browser-support-banner` not visible (`index.html:14-31, 32-55`). Element either absent or has `display:none`.

**Then** spoof IE11 UA (`Trident/7.0`) — banner becomes visible with text **"Your browser is not supported. Please upgrade to a modern browser for the best experience."** plus a `Dismiss` button (`data-testid="browser-support-dismiss"`, `index.html:48`). Clicking Dismiss persists `sessionStorage.browser-support-dismissed=1`.

**Pass criteria**: banner appears only for IE/Trident UA strings.

**Severity if failing**: Low.

---

### TC-1.6 — Viewports — landing renders without horizontal scroll

**Steps**

1. Set viewport to xs (375 × 667), then md (768 × 1024), then lg (1280 × 800).
2. Reload landing.

**UI verification**

- No horizontal scrollbar at any breakpoint.
- Heading remains centered/visible.

**Breakpoints reference**: `frontend/projects/components/src/lib/breakpoints/_mixins.scss:4-32` (sm 576, md 768, lg 992, xl 1200, xxl 1400).

**Pass criteria**: no overflow at any tested viewport.

**Severity if failing**: Medium.

---

### TC-1.7 — Security response headers are present

**Steps**

1. DevTools › Network › click any API request (e.g. `GET /api/v1/dashboard`) → Response Headers.

**UI verification**: N/A.

**Behavior verification**

Verify every header is set per `backend/src/TheUpperRoom.Api/Program.cs:36-53`:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Cross-Origin-Opener-Policy: same-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'`
- `X-Correlation-Id: <guid>` present and echoed (`Program.cs:55-62`).

**Pass criteria**: all headers match exactly.

**Severity if failing**: Critical (security regression).
