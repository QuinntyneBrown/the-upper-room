import { HttpContextToken } from '@angular/common/http';

export const SKIP_ERROR_SNACKBAR = new HttpContextToken<boolean>(() => false);

/**
 * Suppresses the global error snackbar only for server (5xx) and network failures,
 * for requests whose caller reports those itself (optimistic mutations, L2-114).
 * Client errors (4xx) still surface through the catalog.
 */
export const SKIP_SERVER_ERROR_SNACKBAR = new HttpContextToken<boolean>(() => false);
