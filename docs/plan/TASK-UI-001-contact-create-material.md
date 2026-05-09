# TASK-UI-001 — Migrate `contact-create.html` to Angular Material / Component Library

**Status:** Accepted  
**Priority:** P1  
**Effort:** Medium (1–2 days)  
**File:** `frontend/projects/the-upper-room/src/app/contacts/contact-create/contact-create.html`

---

## Problem

`contact-create.html` uses raw HTML elements with custom CSS classes throughout. None of the form controls or action buttons use the Angular Material wrappers provided by the `components` library.

## Non-Compliant Elements Found

### Buttons (save bar)
```html
<!-- Current -->
<button class="btn-outlined" (click)="onCancel()">Cancel</button>
<button class="btn-filled" [disabled]="submitting()">Save</button>

<!-- Required -->
<tar-button variant="outlined" (clicked)="onCancel()">Cancel</tar-button>
<tar-button variant="filled" type="submit" [disabled]="submitting()">Save</tar-button>
```

### Text Inputs (12+ instances)
All `<input class="field__input">` elements for: `firstName`, `lastName`, `pronouns`, `title`, `org`, `displayName`, phone value, phone label, email value, email label, address fields.

```html
<!-- Current -->
<label class="field__label" for="contact-first-name">First name *</label>
<input id="contact-first-name" class="field__input" type="text" ... />
<span class="field__error">{{ firstNameError() }}</span>

<!-- Required -->
<tar-text-field
  label="First name"
  testId="contact-first-name"
  [required]="true"
  [value]="firstName()"
  [error]="firstNameError()"
  (valueChange)="firstName.set($event)"
/>
```

### Remove Buttons (icon buttons)
```html
<!-- Current -->
<button class="btn-icon" aria-label="Remove phone">×</button>

<!-- Required -->
<tar-icon-button icon="close" ariaLabel="Remove phone" (clicked)="removePhone($index)" />
```

### Add Buttons
```html
<!-- Current -->
<button class="btn-add" (click)="addPhone()">+ Add phone</button>

<!-- Required -->
<tar-button variant="outlined" icon="add" (clicked)="addPhone()">Add phone</tar-button>
```

### Checkboxes (2 instances — phone primary, email primary)
```html
<!-- Current -->
<label class="method-row__primary">
  <input type="checkbox" [checked]="phone.primary" (change)="updatePhone($index, 'primary', $any($event.target).checked)" />
  Primary
</label>

<!-- Required -->
<tar-checkbox [checked]="phone.primary" (checkedChange)="updatePhone($index, 'primary', $event)">
  Primary
</tar-checkbox>
```

### Form Banner
The `<div class="form-banner">` should use the `tar-banner` component if appropriate, or stay as-is if it's app-specific styling.

## Acceptance Criteria

- [ ] Save bar Cancel/Save buttons → `tar-button` with correct `variant`
- [ ] All `<input class="field__input">` text inputs → `tar-text-field` with `label`, `error`, `testId` inputs
- [ ] Phone/email remove buttons → `tar-icon-button icon="close"`
- [ ] Add phone / Add email / Add address buttons → `tar-button variant="outlined" icon="add"`
- [ ] Phone primary / email primary checkboxes → `tar-checkbox`
- [ ] No raw `<label class="field__label">` or `<span class="field__error">` wrappers remain
- [ ] All `data-testid` attributes preserved via `testId` inputs on `tar-*` components
- [ ] Component renders and form submit still works after change

## Notes

- The phone/email repeater pattern (dynamic rows) requires checking how `tar-text-field` and `tar-checkbox` wire up to array signals — use `(valueChange)` output and index-based updater functions.
- Address inputs (`street`, `city`, `country`) currently have no event bindings — add proper `(valueChange)` wiring when migrating.
- `tar-text-field` supports `type="tel"` and `type="email"` via its `type` input.
