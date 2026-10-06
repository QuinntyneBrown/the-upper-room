A human-friendly "time ago" label. `tar-relative-time` is a plain Angular component (no Material primitive) whose template is just the formatted text — no wrapper element, BEM classes or `data-testid` — so style it from the host.

`timestamp` (required) takes a `Date` or an ISO string. Output is `just now` under a minute, then `{n}m ago`, `{n}h ago` and `{n}d ago` up to seven days, and after that a date formatted with Angular's `formatDate` as `MMM d, y` in the app's `LOCALE_ID`. A one-minute timer started outside the Angular zone refreshes the label and is cleared on destroy.
