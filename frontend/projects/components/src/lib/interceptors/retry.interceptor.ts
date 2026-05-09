// traces_to: L2-084
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { retry, timer } from 'rxjs';

const RETRYABLE = new Set([0, 502, 503, 504]);
const DELAYS_MS = [300, 900];

export const retryInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next(req);
  return next(req).pipe(
    retry({
      count: DELAYS_MS.length,
      delay: (error, attempt) => {
        if (!(error instanceof HttpErrorResponse) || !RETRYABLE.has(error.status)) {
          throw error;
        }
        const jitter = Math.random() * 100;
        return timer(DELAYS_MS[attempt - 1]! + jitter);
      },
    }),
  );
};
