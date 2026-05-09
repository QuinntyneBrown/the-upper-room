# TASK-UI-013 — Migrate `invite-user-dialog.html` (domain) to Angular Material / Component Library

**Status:** Complete  
**Priority:** P1  
**Effort:** Small (< 1 day)  
**File:** `frontend/projects/domain/src/lib/users/invite-user-dialog/invite-user-dialog.html`

---

## Problem

`invite-user-dialog.html` is a domain library component used globally throughout the app (rendered in `user-list.html`). It uses raw inputs, a raw select, a raw textarea, and raw buttons — bypassing the `components` library entirely. Because this is a shared domain component, fixing it improves compliance across every feature that renders it.

## Non-Compliant Elements Found

### Dialog Shell → `tar-dialog` or `MatDialog`
```html
<!-- Current -->
<div class="backdrop" (click)="cancelled.emit()"></div>
<form class="dialog" role="dialog" aria-modal="true" ...>...</form>

<!-- Required -->
<!-- Option A: wrap content in tar-dialog component -->
<!-- Option B: open via MatDialog in user-list (caller) and remove backdrop div -->
```

### Action Buttons
```html
<!-- Current -->
<button class="btn btn--ghost" (click)="cancelled.emit()">Cancel</button>
<button class="btn" type="submit" [disabled]="!canSubmit()">Send invitation</button>

<!-- Required -->
<tar-button variant="text" testId="invite-cancel" (clicked)="cancelled.emit()">Cancel</tar-button>
<tar-button variant="filled" testId="invite-submit" type="submit" [disabled]="!canSubmit()">Send invitation</tar-button>
```

### Email Input
```html
<!-- Current -->
<input class="field__input" type="email" [value]="email()" ... />
<span class="field__error">{{ emailError }}</span>

<!-- Required -->
<tar-text-field
  testId="invite-email"
  label="Email"
  type="email"
  autocomplete="email"
  [value]="email()"
  [error]="emailError"
  (valueChange)="email.set($event)"
/>
```

### First Name / Last Name Inputs
```html
<!-- Current -->
<input class="field__input" type="text" [value]="firstName()" ... />
<input class="field__input" type="text" [value]="lastName()" ... />

<!-- Required -->
<tar-text-field testId="invite-first-name" label="First name" [value]="firstName()" (valueChange)="firstName.set($event)" />
<tar-text-field testId="invite-last-name" label="Last name" [value]="lastName()" (valueChange)="lastName.set($event)" />
```

### Role Select
```html
<!-- Current -->
<select class="field__input" [value]="role()" (change)="role.set($any($event.target).value)">
  @for (r of roles; track r) { <option [value]="r">{{ r }}</option> }
</select>

<!-- Required -->
<tar-select
  testId="invite-role"
  label="Role"
  [value]="role()"
  [options]="roleOptions"
  (valueChange)="role.set($event)"
/>
```
*`roleOptions` computed in component: `roles.map(r => ({ label: r, value: r }))`*

### City Input
```html
<!-- Current -->
<input class="field__input" type="text" [value]="city()" ... />

<!-- Required -->
<tar-text-field testId="invite-city" label="City" [value]="city()" (valueChange)="city.set($event)" />
```

### Personal Message Textarea
```html
<!-- Current -->
<textarea class="field__input" rows="3" [value]="message()" ...></textarea>

<!-- Required -->
<tar-textarea
  testId="invite-message"
  label="Personal message (optional)"
  [rows]="3"
  [value]="message()"
  (valueChange)="message.set($event)"
/>
```

## Acceptance Criteria

- [x] Dialog shell → `tar-dialog` or `MatDialog` approach (coordinate with TASK-UI-011 caller)
- [x] Email input → `tar-text-field` with `type="email"`, `error` binding
- [x] First name / last name → `tar-text-field`
- [x] Role select → `tar-select` with computed `roleOptions`
- [x] City input → `tar-text-field`
- [x] Personal message → `tar-textarea`
- [x] Cancel button → `tar-button variant="text"`
- [x] Send invitation button → `tar-button variant="filled"` with `[disabled]`
- [x] All `data-testid` attributes preserved
- [x] `cancelled` and `submitted` outputs still emit correctly
- [x] `emailError` input prop still wires error display via `tar-text-field`

## Notes

- This is a **domain library** component — changes here affect all callers. Run the full user-invite flow after migrating.
- `roleOptions` should be a computed getter in the component class, not computed in the template.
- The `canSubmit()` guard on the submit button must be preserved.
