// traces_to: L2-066, L2-084
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { SKIP_ERROR_SNACKBAR } from 'api';
import { SnackbarService } from 'components';
import { mapErrorToMessage } from './error-catalog';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackbar = inject(SnackbarService);
  return next(req).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse && !req.context.get(SKIP_ERROR_SNACKBAR)) {
        const code = (err.error as { code?: string } | null)?.code;
        snackbar.show(mapErrorToMessage(err.status, code), 'error');
      }
      return throwError(() => err);
    }),
  );
};
