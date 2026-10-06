The state shown when a list fails to load. `tar-list-error` renders a centred error `tar-icon`, the fixed heading "We couldn't load this", a body line "Something went wrong. Reference: {correlationId}" and a Material `mat-flat-button` "Try again" that emits `retry`.

Inputs: `correlationId` (required — the server's request/correlation id, so support can find the failure in the logs). Output: `retry`. BEM classes: `.tar-list-error__icon`, `.tar-list-error__heading` (an `h2`), `.tar-list-error__body` and `.tar-list-error__retry`. Test ids: `error-heading`, `error-body` and `error-retry`.
