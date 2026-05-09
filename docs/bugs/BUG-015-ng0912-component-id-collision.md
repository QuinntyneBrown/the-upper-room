---
id: BUG-015
title: NG0912 Component ID Collision — 9 components registered twice
severity: Medium
status: Fixed
suite: TC-01 Getting Started
discovered_at: 2026-05-09T14:52:00Z
---

# BUG-015: NG0912 Component ID Collision — 9 components registered twice

## Summary

Nine Angular components from the `components` library log `NG0912` warnings on every page load because they are loaded twice by the Vite bundler — once from `dist/components` directly and again as a dependency of `dist/domain`.

## Console Output

```
[WARNING] NG0912: Component ID generation collision detected. Components '_TarIcon' and '_TarIcon'
  with selector 'tar-icon' generated the same component ID.
```

Affected components:
- `_TarIcon` (`tar-icon`)
- `_TarEmptyState` (`tar-empty-state`)
- `_TarAvatar` (`tar-avatar`)
- `_TarConfirmDialog` (`tar-confirm-dialog`)
- `_TarShareButton` (`tar-share-button`)
- `_NoteHistoryDialog` (`tar-note-history-dialog`)
- `_TarNotes` (`tar-notes`)
- `_TarMarkdownEditor` (`tar-markdown-editor`)
- `_TarSnackbar` (`tar-snackbar`)

## Root Cause

The Angular monorepo has three library projects: `api`, `components`, `domain`. Both `components` and `domain` are listed in `tsconfig.json` path mappings pointing to `./dist/{name}`. When Vite pre-bundles the app, it encounters `components` both as a direct import from the app AND as a transitive dependency of `domain`. Because both paths resolve to different absolute paths in `dist/`, Vite treats them as separate modules, causing Angular to register each component class twice.

## Impact

- 9 warnings on every page load (developer experience / noisy console)
- Risk of subtle runtime bugs if the two registrations diverge (e.g., one is from a stale build)
- No current user-visible breakage, but collisions can cause unexpected behavior in change detection and view encapsulation

## Steps to Reproduce

1. Start the Angular dev server (`ng serve`)
2. Open browser DevTools console
3. Navigate to any page
4. Observe 9 `NG0912` warnings

## Expected

No NG0912 warnings — each component registered exactly once.

## Proposed Fix

Configure Vite to deduplicate the `components` library by adding an alias in the Angular build configuration so both import paths resolve to the same module:

```typescript
// In vite.config or angular.json extended build options
{
  resolve: {
    alias: {
      'components': path.resolve(__dirname, 'dist/components')
    },
    dedupe: ['components']
  }
}
```

Alternatively, ensure `domain`'s `dist/` re-exports from `components` via peer dependency rather than bundling it.
