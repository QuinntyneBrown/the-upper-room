# The Upper Room

![.NET](https://img.shields.io/badge/.NET-10-512bd4?logo=dotnet&logoColor=white)
![Angular](https://img.shields.io/badge/Angular-21-dd0031?logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?logo=typescript&logoColor=white)
![Tests](https://img.shields.io/badge/tests-Vitest-6e9f18?logo=vitest&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)

The Upper Room is a full-stack application composed of an ASP.NET Core backend and an Angular frontend. The backend exposes the HTTP API and is structured as a layered solution (Domain, Application, Infrastructure, Api). The frontend is an Angular workspace containing the main application shell plus reusable libraries for API integration, shared UI components, and domain logic.

> Status: early development. Both halves of the stack are scaffolded and ready for feature work; the visible app experience is still being built out.

## Contents

- [Repository Layout](#repository-layout)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Backend](#backend)
- [Frontend](#frontend)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [Security](#security)
- [License](#license)

## Repository Layout

```text
.
+-- backend/                 # ASP.NET Core (.NET 10) solution
|   +-- src/
|   |   +-- TheUpperRoom.Api/             # HTTP API host
|   |   +-- TheUpperRoom.Application/     # Application/use-case layer
|   |   +-- TheUpperRoom.Domain/          # Domain models and rules
|   |   +-- TheUpperRoom.Infrastructure/  # Persistence and integrations
|   |   ...
|   +-- tests/                            # xUnit test projects per layer
|   +-- TheUpperRoom.sln
+-- frontend/                # Angular 21 workspace
|   +-- projects/
|   |   +-- api/             # API integration library
|   |   +-- components/      # Shared Angular component library
|   |   +-- domain/          # Domain models and business logic library
|   |   +-- the-upper-room/  # Main Angular application
|   +-- angular.json
|   +-- package.json
+-- docs/                    # Specs, plans, design assets, ICDs
```

## Tech Stack

**Backend**

- [.NET](https://dotnet.microsoft.com/) 10
- ASP.NET Core (Web SDK)
- xUnit for testing

**Frontend**

- [Angular](https://angular.dev/) 21
- [TypeScript](https://www.typescriptlang.org/) 5.9
- [RxJS](https://rxjs.dev/) 7.8
- [Vitest](https://vitest.dev/) 4
- [ng-packagr](https://github.com/ng-packagr/ng-packagr) for Angular library packaging
- [Prettier](https://prettier.io/) for formatting

## Prerequisites

- [.NET SDK 10](https://dotnet.microsoft.com/download)
- Node.js compatible with Angular 21
- npm 10 or newer

## Getting Started

Clone the repository and install dependencies for the side(s) you plan to work on.

```bash
git clone <repo-url> the-upper-room
cd the-upper-room
```

Then follow the [Backend](#backend) or [Frontend](#frontend) instructions below.

## Backend

The backend is a layered .NET solution under [`backend/`](backend).

### Architecture

The backend follows a Clean Architecture layout. Dependencies point inward — outer layers know about inner layers, never the reverse.

```text
┌────────────────────────────────────────────────────────────────────┐
│ TheUpperRoom.Api  (HTTP boundary)                                  │
│  - Controllers, [Authorize], [FromBody], JWT/PKCE auth wiring      │
│  - ExceptionHandling: ValidationProblemDetails mapping             │
│  - Hosts MediatR, FluentValidation, OpenAPI, DI composition        │
│  - Owns request DTOs that bind from HTTP only                      │
└────────────────────────────────────────────────────────────────────┘
                              ▲
                              │ depends on
                              │
┌────────────────────────────────────────────────────────────────────┐
│ TheUpperRoom.Application  (use cases / CQRS)                       │
│  - <Feature>/I<Feature>DbContext  (e.g. IContactsDbContext)        │
│  - <Feature>/<Action>Command + Result + Handler                    │
│  - <Feature>/<Action>Query + Result + Handler                      │
│  - <Feature>/<Action>CommandValidator (FluentValidation)           │
│  - Application-shape DTOs returned by handlers                     │
│  - Cross-feature aggregators (e.g. Dashboard) consume the          │
│    per-feature interfaces, not concrete EF contexts                │
└────────────────────────────────────────────────────────────────────┘
                              ▲
                              │ depends on
                              │
┌────────────────────────────────────────────────────────────────────┐
│ TheUpperRoom.Domain  (entities, value objects, business rules)     │
│  - Domain.<Feature>/* entities + value objects                     │
│  - Domain.Rbac (Permission, RoleDefinition, RoleCatalog)           │
│  - No EF, no ASP.NET, no MediatR — pure C#                         │
└────────────────────────────────────────────────────────────────────┘
                              ▲
                              │ implements interfaces from
                              │
┌────────────────────────────────────────────────────────────────────┐
│ TheUpperRoom.Infrastructure  (persistence + external integrations) │
│  - <Feature>/<Feature>DbContext : DbContext, I<Feature>DbContext   │
│  - Auth/PasswordHasher : IPasswordHasher                           │
│  - Rbac/PermissionChecker : IPermissionChecker                     │
│  - Seeding/<Feature>/<Feature>DataSeeder : IDataSeeder             │
│  - Users/UsersDbContext + UserDirectory                            │
│  - References Application (down-stream interfaces); never Api      │
└────────────────────────────────────────────────────────────────────┘
```

Cross-cutting rules enforced by `tests/TheUpperRoom.Application.Tests/TechnologyGuidanceArchitectureTests`:

- Every `.cs` file in `backend/src/` declares exactly one top-level type.
- No `*Handler` / `*Command` / `*Query` / `*Validator` / `*DbContext` / `*DataSeeder` / `*Row` types under `TheUpperRoom.Api/` (the test runs with no allow-list entries).
- Application handlers depend on an `I<Feature>DbContext` interface, not a concrete EF context.
- Seeders are registered through `Infrastructure.DependencyInjection.AddSeeders`, never one-off `AddScoped<IDataSeeder, ...>` lines in `Program.cs`.
- `TheUpperRoom.Application` does not reference `Microsoft.EntityFrameworkCore.SqlServer` or any `Microsoft.AspNetCore.*` package.

### Restore and Build

```bash
cd backend
dotnet restore
dotnet build
```

### Run the API

```bash
cd backend
dotnet run --project src/TheUpperRoom.Api
```

### Test

```bash
cd backend
dotnet test
```

To run a single layer's tests, target its project:

```bash
dotnet test tests/TheUpperRoom.Domain.Tests
dotnet test tests/TheUpperRoom.Application.Tests
dotnet test tests/TheUpperRoom.Infrastructure.Tests
dotnet test tests/TheUpperRoom.Api.Tests
```

## Frontend

The frontend is an Angular workspace under [`frontend/`](frontend). The npm lockfile is committed for reproducible installs; use `npm ci`.

### Install

```bash
cd frontend
npm ci
```

### Run Locally

```bash
cd frontend
npm start
```

The development server runs at `http://localhost:4200/` by default and reloads when source files change.

### Available Scripts

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

### Where Code Goes

- `projects/api` — API clients and transport concerns.
- `projects/components` — reusable UI components.
- `projects/domain` — domain models and business rules.
- `projects/the-upper-room` — app composition and user-facing routes.

### Testing

```bash
cd frontend
npm test
```

For a specific project:

```bash
npm run ng -- test api
npm run ng -- test components
npm run ng -- test domain
npm run ng -- test the-upper-room
```

### Building

```bash
cd frontend
npm run build
```

Build output is written to `frontend/dist/`. To build a specific project, pass the project name to the Angular CLI:

```bash
npm run ng -- build the-upper-room
npm run ng -- build components
```

## Documentation

Project documentation lives under [`docs/`](docs):

- `docs/specs/` — requirements (L1 high-level, L2 detailed with acceptance criteria).
- `docs/plan/` — task breakdowns.
- `docs/design/` — architecture and design documents.
- `docs/ui-design.pen` — UI design source (Pencil).

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](frontend/CONTRIBUTING.md) before opening an issue or pull request.

By participating in this project, you agree to follow the [Code of Conduct](frontend/CODE_OF_CONDUCT.md).

## Security

Please do not report vulnerabilities through public issues. See [SECURITY.md](frontend/SECURITY.md) for responsible disclosure guidance.

## License

This project is licensed under the [MIT License](frontend/LICENSE).
