# TASK-UI-005 — Migrate `partner-edit.html` to Angular Material / Component Library

**Status:** Complete  
**Priority:** P2  
**Effort:** Medium (1–2 days)  
**File:** `frontend/projects/the-upper-room/src/app/partners/partner-edit/partner-edit.html`

---

## Problem

`partner-edit.html` extends the basic partner form with a dynamic social-links repeater section. It uses raw inputs, selects, and buttons throughout.

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

### Text Inputs (name, website — 2 base fields)
Same pattern as `partner-create.html` — see TASK-UI-004.

### Social Links Repeater (per-row instances)

**Select (platform):**
```html
<!-- Current -->
<select class="field__select" [value]="link.platform" (change)="updatePlatform(i, $any($event.target).value)">
  @for (p of platforms; track p) { <option [value]="p">{{ p }}</option> }
</select>

<!-- Required -->
<tar-select
  label="Platform"
  [value]="link.platform"
  [options]="platformOptions"
  (valueChange)="updatePlatform(i, $event)"
/>
```
*`platformOptions` = `platforms.map(p => ({ label: p, value: p }))`*

**URL input:**
```html
<!-- Current -->
<input class="field__input" type="url" [value]="link.url" ... />

<!-- Required -->
<tar-text-field label="URL" type="url" placeholder="https://..." [value]="link.url" [error]="socialErrors()[i]?.urlError" (valueChange)="updateUrl(i, $event)" />
```

**Label input (conditional, platform === 'Other'):**
```html
<!-- Current -->
<input class="field__input" type="text" [value]="link.label" ... />

<!-- Required -->
<tar-text-field label="Custom label" [value]="link.label" [error]="socialErrors()[i]?.labelError" (valueChange)="updateLabel(i, $event)" />
```

**Remove button (icon):**
```html
<!-- Current -->
<button class="btn-icon" aria-label="Remove link" (click)="removeLink(i)">
  <span class="material-symbols-outlined">close</span>
</button>

<!-- Required -->
<tar-icon-button icon="close" ariaLabel="Remove link" (clicked)="removeLink(i)" />
```

**Add link button:**
```html
<!-- Current -->
<button class="btn-outlined btn-sm" (click)="addLink()">Add link</button>

<!-- Required -->
<tar-button variant="outlined" icon="add" (clicked)="addLink()">Add link</tar-button>
```

### Icon Span (website visit link)
```html
<!-- Current -->
<span class="material-symbols-outlined">open_in_new</span>

<!-- Required -->
<mat-icon>open_in_new</mat-icon>
```

## Acceptance Criteria

- [ ] Save bar Cancel/Save buttons → `tar-button`
- [ ] Name and website text inputs → `tar-text-field`
- [ ] Social platform selects → `tar-select` with `platformOptions` computed array
- [ ] Social URL inputs → `tar-text-field` with `type="url"` and per-row error
- [ ] Social label inputs (conditional) → `tar-text-field`
- [ ] Remove-link icon buttons → `tar-icon-button icon="close"`
- [ ] Add-link button → `tar-button variant="outlined" icon="add"`
- [ ] Icon spans → `<mat-icon>`
- [ ] All per-row `data-testid` attributes preserved via `testId` inputs
- [ ] Dynamic row add/remove still works correctly

## Notes

- `tar-select` takes an `options: { label, value }[]` array — compute `platformOptions` in the component class from the `platforms` string array.
- Per-row errors (`socialErrors()[i]?.urlError`) must be bound via the `error` input on `tar-text-field`.
- The `field__input-group` wrapper around website + trailing link may need to stay for layout.
