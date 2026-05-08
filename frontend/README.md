# The Upper Room

![Angular](https://img.shields.io/badge/Angular-21-dd0031?logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?logo=typescript&logoColor=white)
![Tests](https://img.shields.io/badge/tests-Vitest-6e9f18?logo=vitest&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)

The Upper Room is an Angular workspace for building the project's frontend application and reusable client-side libraries. The repository contains the main application shell plus dedicated libraries for API integration, shared UI components, and domain logic.

> Status: early development. The workspace is ready for application and library development, while the visible app experience is still being built out from the Angular starter shell.

## Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Workspace Layout](#workspace-layout)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Building](#building)
- [Contributing](#contributing)
- [Security](#security)
- [License](#license)

## Features

- Angular 21 application workspace configured with SCSS.
- Library projects for API access, UI components, and domain code.
- Vitest-based unit test setup through Angular's unit-test builder.
- Production and development build configurations for the app and libraries.
- npm lockfile committed for reproducible installs.

## Tech Stack

- [Angular](https://angular.dev/) 21
- [TypeScript](https://www.typescriptlang.org/) 5.9
- [RxJS](https://rxjs.dev/) 7.8
- [Vitest](https://vitest.dev/) 4
- [ng-packagr](https://github.com/ng-packagr/ng-packagr) for Angular library packaging
- [Prettier](https://prettier.io/) for formatting

## Workspace Layout

```text
.
+-- projects/
|   +-- api/             # API integration library
|   +-- components/      # Shared Angular component library
|   +-- domain/          # Domain models and business logic library
|   +-- the-upper-room/  # Main Angular application
+-- angular.json         # Angular workspace configuration
+-- package.json         # npm scripts and dependencies
+-- tsconfig.json        # Shared TypeScript configuration
```

## Getting Started

### Prerequisites

- Node.js compatible with Angular 21
- npm 10 or newer

This workspace was created with npm and includes `package-lock.json`; use `npm ci` for clean, repeatable installs.

### Installation

```bash
npm ci
```

### Run Locally

```bash
npm start
```

The development server runs at `http://localhost:4200/` by default and reloads when source files change.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm start` | Start the Angular development server. |
| `npm run build` | Build the default Angular project for production. |
| `npm run watch` | Build continuously with the development configuration. |
| `npm test` | Run unit tests through Angular's test builder. |
| `npm run ng -- <args>` | Run Angular CLI commands through the local CLI version. |

You can also target individual workspace projects directly:

```bash
npm run ng -- build the-upper-room
npm run ng -- build api
npm run ng -- build components
npm run ng -- build domain
npm run ng -- test the-upper-room
```

## Development Workflow

1. Create a focused branch for your change.
2. Install dependencies with `npm ci`.
3. Run `npm start` while developing the application.
4. Keep shared code in the appropriate library:
   - `projects/api` for API clients and transport concerns.
   - `projects/components` for reusable UI components.
   - `projects/domain` for domain models and business rules.
   - `projects/the-upper-room` for app composition and user-facing routes.
5. Add or update tests for behavior changes.
6. Run `npm test` and `npm run build` before opening a pull request.

## Testing

```bash
npm test
```

For a specific project:

```bash
npm run ng -- test api
npm run ng -- test components
npm run ng -- test domain
npm run ng -- test the-upper-room
```

## Building

```bash
npm run build
```

Build output is written to `dist/`. To build a specific project, pass the project name to the Angular CLI:

```bash
npm run ng -- build the-upper-room
npm run ng -- build components
```

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening an issue or pull request.

By participating in this project, you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## Security

Please do not report vulnerabilities through public issues. See [SECURITY.md](SECURITY.md) for responsible disclosure guidance.

## License

This project is licensed under the [MIT License](LICENSE).
