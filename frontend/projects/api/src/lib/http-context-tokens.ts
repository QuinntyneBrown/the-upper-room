import { HttpContextToken } from '@angular/common/http';

export const SKIP_ERROR_SNACKBAR = new HttpContextToken<boolean>(() => false);
