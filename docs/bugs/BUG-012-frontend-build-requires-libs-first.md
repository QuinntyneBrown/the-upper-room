# BUG-012 — Frontend dev server fails to compile on a fresh clone without first building workspace libs

**Severity**: High
**Component**: docs / dev-experience
**Found in test**: pre-flight (test plan §0 setup)
**Found**: 2026-05-09

## Description

`docs/test-plan/00-overview.md` and standard practice say to start the frontend with `npx ng serve the-upper-room`. On a fresh clone (or after `node_modules` is recreated), that command fails with hundreds of TypeScript / Angular compiler errors because the workspace libraries `api`, `components`, and `domain` are referenced via path aliases that point into `dist/`:

```jsonc
// tsconfig.json
"paths": {
  "api":        ["./dist/api"],
  "components": ["./dist/components"],
  "domain":     ["./dist/domain"]
}
```

`ng serve` does not build these libs as a prerequisite, so until `dist/api`, `dist/components`, and `dist/domain` are populated, the app sees:

```
TS2307: Cannot find module 'components' or its corresponding type declarations.
TS2307: Cannot find module 'api' or its corresponding type declarations.
TS2307: Cannot find module 'domain' or its corresponding type declarations.
NG1010: 'imports' must be an array of components, directives, pipes, or NgModules.
```

…and the dev server never binds to a port.

## Reproduction

```powershell
cd C:\projects\the-upper-room\frontend
rm -r dist
npx ng serve the-upper-room --port 4300
# → "Application bundle generation failed" with the above errors. No HTTP server.
```

## Expected

Either:

1. `ng serve the-upper-room` builds the dependent libraries automatically, or
2. The README / `docs/test-plan/00-overview.md` documents the prerequisite build steps explicitly.

## Actual

Neither is true. A first-time tester runs `ng serve`, waits, sees compile errors scroll past, and has nothing to test against.

## Workaround

```powershell
cd C:\projects\the-upper-room\frontend
npx ng build api && npx ng build domain && npx ng build components
npx ng serve the-upper-room --port 4300
```

After the libs exist in `dist/`, the dev server compiles cleanly and serves on the chosen port.

## Suggested fix

- Add a `prestart` npm script: `"prestart": "ng build api && ng build domain && ng build components"`.
- Or configure each library project to be implicitly built when consumed by the app (Angular CLI supports library project references).
- Or — cheapest fix — add a numbered prerequisite list to `docs/test-plan/00-overview.md` (`npm install`, then build the libs, then `ng serve`).
