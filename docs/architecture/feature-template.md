# Backend Feature Template

Use this guide when adding a backend feature. Follow [AGENTS.md](../../AGENTS.md) for the development workflow and repository conventions.

## Layer responsibilities

Dependencies point inward: API uses Application, Application uses Domain, and Infrastructure implements Application interfaces.

- **API:** Bind HTTP input, resolve the current user, dispatch commands and queries, and translate results into HTTP responses. Keep business rules and persistence out of controllers.
- **Application:** Define commands, queries, results, validators, and the interfaces handlers need. Coordinate use cases and authorization through those interfaces.
- **Domain:** Define entities, value objects, and framework-independent business rules.
- **Infrastructure:** Implement persistence and external integrations. Keep seed data idempotent and safe to run repeatedly.

## Adding a feature

1. Define the requirement, detailed design, and mock before changing production behavior, following the incremental implementation and ATDD workflow in `AGENTS.md`.
2. Keep related types in feature folders within each layer. Follow the nearby implementation's naming and registration conventions.
3. Define Application interfaces for persistence and external dependencies; supply their implementations through dependency injection.
4. Keep input validation separate from business outcomes, and map both consistently at the HTTP boundary.
5. Add API integration tests for the acceptance criteria and run the relevant regression checks for each slice.

## Sharing data across features

Use Application interfaces when one feature needs data from another. Keep cross-feature coordination in handlers or services rather than calling another controller.

Consult the current code for concrete type names, dependency injection registration, and persistence configuration.
