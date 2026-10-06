// traces_to: L2-066, L2-084
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { SKIP_ERROR_SNACKBAR, SKIP_SERVER_ERROR_SNACKBAR } from 'api';
import { SnackbarService } from 'components';
import { mapErrorToMessage } from './error-catalog';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackbar = inject(SnackbarService);
  return next(req).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse && !req.context.get(SKIP_ERROR_SNACKBAR)) {
        const isServerFailure = err.status === 0 || err.status >= 500;
        if (!(isServerFailure && req.context.get(SKIP_SERVER_ERROR_SNACKBAR))) {
          const payload = (err.error ?? null) as { code?: string; message?: string; error?: string } | null;
          const serverMessage =
            typeof payload?.message === 'string' ? payload.message : typeof payload?.error === 'string' ? payload.error : undefined;
          snackbar.show(mapErrorToMessage(err.status, payload?.code, serverMessage), 'error');
        }
      }
      return throwError(() => err);
    }),
  );
};
