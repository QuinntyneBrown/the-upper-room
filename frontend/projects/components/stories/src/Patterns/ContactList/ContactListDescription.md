The `/contacts` screen (user guide section 5.1): browse, search and filter the contacts in the active city. Every other list screen (partners, locations, ideas) follows the same composition.

- **Header**: `tar-page-header` with the city as `eyebrow`, a count `subtitle` and the primary "New contact" `tar-button` (`icon="person_add"`) in its actions slot. On phones that action moves to a `tar-fab`.
- **Filters**: one `tar-search-field` ("Search contacts", matches name, organisation, email and phone) and a selectable `tar-chip` "Archived" that adds archived contacts back in. Both filter as you type or toggle.
- **Results**: a grid of outlined, `[interactive]` `tar-card`s. Each holds a `tar-avatar` (48px, initials on a colour derived from the email), the name, title @ organisation, phone and email, and the contact's tags as `tar-chip`s inside a `tar-chip-set`. Archived contacts are dimmed and carry an "Archived" chip.
- **Paging**: `tar-pagination` on tablet and desktop; "Load more" on phones.
- **States** replace the results area only, never the header or filters: `tar-skeleton` while loading, `tar-empty-state` for an empty city or a search with no matches, `tar-list-error` (with correlation id and retry) when the request fails.

Stable hooks mirror the app: `contacts-search`, `contacts-filter-archived`, `contacts-new-button`, `contacts-grid`, `contact-card-<name>`, `contacts-empty-state`, `contacts-paginator`, `contacts-load-more`, `contacts-fab`.
