# Section 15 — Keyboard Shortcuts

> Mirrors `docs/user-guide.md` §15.

## Pre-conditions

- Signed in.
- Mouse-free testing required for the keyboard tests below.

## Tests

### TC-15.1 — Ctrl+K / ⌘+K opens global search

**Steps**

1. From any authenticated route press **Ctrl+K** (Win/Linux) or **⌘+K** (Mac).

**UI verification**

- Global search overlay appears (`<app-global-search>` mounted from `frontend/projects/the-upper-room/src/app/shell/app-shell/app-shell.html:5`).

**Pass criteria**: opens reliably from inputs, lists, and idle pages.

**Severity if failing**: High.

---

### TC-15.2 — Esc closes search

**Steps**

1. Open search.
2. Press **Esc**.

**UI verification**

- Overlay unmounts; previous focus restored.

**Pass criteria**: closes; focus restored.

**Severity if failing**: Medium.

---

### TC-15.3 — Esc closes drawer

**Steps**

1. Open the side drawer.
2. Press **Esc** (drawer has `(keydown.escape)="closeDrawer()"`, `app-shell.html:54`).

**UI verification**

- Drawer collapses; `aria-hidden` flips to `true`.

**Pass criteria**: closes via Esc.

**Severity if failing**: Medium (a11y).

---

### TC-15.4 — Esc closes dialogs

**Steps**

1. Open the card detail dialog (`<div data-testid="card-detail-dialog" role="dialog">`).
2. Press **Esc**.

**UI verification**

- Dialog closes; focus returns to the card on the board.
- Repeat for: link-contact dialog, partner delete dialog, event cancel dialog, attendees dialog, recurrence-edit dialog, board move sheet.

**Pass criteria**: every modal closes on Esc.

**Severity if failing**: Medium (a11y).

---

### TC-15.5 — Tab order through controls

**Steps**

1. Land on `/sign-in`.
2. Press **Tab** repeatedly.

**UI verification**

- Order: Email → Password → eye toggle → Sign in → Forgot password → Create account.
- Focus ring visible (token-driven outline).
- Reverse with **Shift+Tab** must traverse in opposite order.

**Pass criteria**: tab order is logical and matches DOM order.

**Severity if failing**: Medium.

---

### TC-15.6 — Enter activates focused button

**Steps**

1. Focus any `<tar-button>` or native `<button>` (e.g. **Sign in**).
2. Press **Enter**.

**UI verification**

- Button click handler fires (e.g. submits the form).

**Pass criteria**: Enter triggers the same action as a click.

**Severity if failing**: Medium.

---

### TC-15.7 — Enter opens highlighted search result

**Steps**

1. Open global search; type a query.
2. Use **↓** to highlight a result.
3. Press **Enter**.

**UI verification**

- Routes to that result's detail page (handler in `frontend/projects/the-upper-room/src/app/search/global-search.ts`).

**Pass criteria**: navigation occurs.

**Severity if failing**: High.

---

### TC-15.8 — Skip to main content link

**Steps**

1. From a fresh load, press **Tab** as the first action.

**UI verification**

- The skip link `<a data-testid="skip-link" href="#main">Skip to main content</a>` (`app-shell.html:8`) becomes visible (off-screen unless focused).
- Activating it focuses `<main id="main" tabindex="-1">`. The handler `skipToMain($event)` prevents the default anchor jump.

**Pass criteria**: link visible on focus and works.

**Severity if failing**: Medium (a11y).

---

### TC-15.9 — Focus trap in dialogs

**Steps**

1. Open the recurrence-edit dialog (`event-form.html:2`, `data-testid="recurrence-edit-dialog"`).
2. Press **Tab** repeatedly.

**UI verification**

- Focus stays inside the dialog and cycles between its three buttons.
- Pressing **Shift+Tab** also stays inside.

**Pass criteria**: focus does not escape the modal until it closes.

**Severity if failing**: Medium (a11y).

---

### TC-15.10 — Reduced-motion preference is honored

**Steps**

1. In OS settings enable **Reduce motion** (or DevTools → Rendering → Emulate `prefers-reduced-motion: reduce`).
2. Reload.

**UI verification**

- Per `frontend/projects/components/src/lib/tokens/_tokens.scss:173-181`, all CSS transitions and animations have their durations forced to `0ms`.
- Verify via DevTools Computed: any animated element shows `transition-duration: 0s`.

**Pass criteria**: no animated motion under reduced-motion.

**Severity if failing**: Medium (a11y).
