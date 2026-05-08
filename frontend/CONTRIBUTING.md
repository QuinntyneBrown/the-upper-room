# Contributing

Thank you for your interest in contributing to The Upper Room. This guide keeps contributions consistent and reviewable.

## Ways to Contribute

- Report bugs with clear reproduction steps.
- Suggest focused improvements or new features.
- Improve documentation, tests, accessibility, or developer tooling.
- Submit pull requests that address an open issue or clearly described problem.

## Local Setup

```bash
npm ci
npm start
```

The app runs at `http://localhost:4200/` by default.

## Before You Open a Pull Request

Run the main validation commands:

```bash
npm test
npm run build
```

Make sure your pull request:

- Has a clear title and description.
- Explains user-visible behavior changes.
- Includes tests for behavior changes where practical.
- Keeps changes focused on one problem.
- Avoids unrelated formatting, generated output, or dependency churn.

## Project Boundaries

- Put API client and transport concerns in `projects/api`.
- Put reusable Angular UI in `projects/components`.
- Put domain types, models, and business rules in `projects/domain`.
- Put app routes, page composition, and application wiring in `projects/the-upper-room`.

## Issues

When reporting a bug, include:

- What happened.
- What you expected to happen.
- Steps to reproduce the issue.
- Browser, operating system, and Node.js versions when relevant.
- Screenshots or logs if they clarify the problem.

## Code Style

This project uses TypeScript, Angular, SCSS, and Prettier. Prefer the established patterns in nearby files over introducing new abstractions. Keep comments short and focused on non-obvious behavior.

## Pull Request Review

Maintainers may ask for changes before merging. Reviews focus on correctness, maintainability, accessibility, tests, and consistency with the existing workspace structure.

## Code of Conduct

All contributors are expected to follow the [Code of Conduct](CODE_OF_CONDUCT.md).
