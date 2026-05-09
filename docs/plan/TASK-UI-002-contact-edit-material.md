# TASK-UI-002 — Migrate `contact-edit.html` to Angular Material / Component Library

**Status:** Accepted  
**Priority:** P1  
**Effort:** Medium (1–2 days)  
**File:** `frontend/projects/the-upper-room/src/app/contacts/contact-edit/contact-edit.html`

---

## Problem

`contact-edit.html` mirrors `contact-create.html` in structure and has the same non-compliant raw HTML elements. All form controls use custom CSS class patterns instead of `tar-*` components.

## Non-Compliant Elements Found

### Buttons (save bar)
```html
<!-- Current -->
<button class="btn-outlined" (click)="onCancel()">Cancel</button>
<button class="btn-filled" [disabled]="submitting()">Save</button>
<button class="banner-btn" (click)="onReload()">Reload</button>

<!-- Required -->
<tar-button variant="outlined" (clicked)="onCancel()">Cancel</tar-button>
<tar-button variant="filled" type="submit" [disabled]="submitting()">Save</tar-button>
<tar-button variant="text" (clicked)="onReload()">Reload</tar-button>
```

### Text Inputs (6 instances)
`<input class="field__input">` for: `firstName`, `lastName`, `pronouns`, `title`, `org`, `displayName`.

```html
<!-- Current -->
<label class="field__label" for="contact-first-name">First name *</label>
<input id="contact-first-name" class="field__input" ... />

<!-- Required -->
<tar-text-field
  label="First name"
  testId="contact-first-name"
  [required]="true"
  [value]="firstName()"
  [error]="firstNameError()"
  (valueChange)="firstName.set($event); setDirty()"
/>
```

## Acceptance Criteria

- [ ] Save bar Cancel/Save/Reload buttons → `tar-button` with correct `variant`
- [ ] All `<input class="field__input">` text inputs → `tar-text-field` with `label`, `error`, `testId`
- [ ] `setDirty()` calls preserved in `(valueChange)` handlers
- [ ] No raw `<label class="field__label">` or `<span class="field__error">` wrappers remain
- [ ] All `data-testid` attributes preserved via `testId` inputs
- [ ] Form submit and cancel still function correctly

## Notes

- This file is nearly identical to `contact-create.html` — tackle both together (TASK-UI-001 and TASK-UI-002) to share the migration pattern.
- The edit form omits the phones/emails/addresses repeater sections present in create — fewer inputs to migrate.
- The `setDirty()` call must be chained in the `(valueChange)` output binding.
