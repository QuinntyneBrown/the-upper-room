# TASK-UI-004 — Migrate `partner-create.html` to Angular Material / Component Library

**Status:** Draft  
**Priority:** P2  
**Effort:** Small (< 1 day)  
**File:** `frontend/projects/the-upper-room/src/app/partners/partner-create/partner-create.html`

---

## Problem

`partner-create.html` uses raw HTML form controls and custom button classes. The form structure is simple (name + website fields) but bypasses the `components` library entirely.

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

### Text Inputs (2 instances)
```html
<!-- Current -->
<label class="field__label" for="partner-name">Name *</label>
<input id="partner-name" class="field__input" type="text" [value]="name()" ... />
<span class="field__error">{{ nameError() }}</span>

<label class="field__label" for="partner-website">Website</label>
<input id="partner-website" class="field__input" type="url" ... />
<span class="field__error">{{ websiteError() }}</span>

<!-- Required -->
<tar-text-field
  label="Name"
  testId="partner-name"
  [required]="true"
  [value]="name()"
  [error]="nameError()"
  (valueChange)="name.set($event)"
/>
<tar-text-field
  label="Website"
  testId="partner-website"
  type="url"
  placeholder="https://example.org"
  [value]="website()"
  [error]="websiteError()"
  (valueChange)="website.set($event)"
/>
```

### Icon Span (visit-website link)
```html
<!-- Current -->
<span class="material-symbols-outlined">open_in_new</span>

<!-- Required -->
<mat-icon>open_in_new</mat-icon>
```

## Acceptance Criteria

- [ ] Cancel/Save buttons → `tar-button` with correct `variant`
- [ ] Name input → `tar-text-field` with `label`, `error`, `required`, `testId`
- [ ] Website input → `tar-text-field` with `type="url"`, `placeholder`, `error`, `testId`
- [ ] `<span class="material-symbols-outlined">` → `<mat-icon>` in the visit-website trailing link
- [ ] No raw `<label class="field__label">` or `<span class="field__error">` wrappers remain
- [ ] Form submit and cancel still function correctly

## Notes

- The `field__input-group` wrapper div (which holds the input + trailing link together) may need to stay as a layout container around `tar-text-field` — check if `tar-text-field` supports a trailing link slot, otherwise keep the wrapper div.
- `websiteValid()` guard on the trailing link — preserve this conditional rendering.
