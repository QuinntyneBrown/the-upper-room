// traces_to: L2-084
import { HttpInterceptorFn } from '@angular/common/http';

export const correlationIdInterceptor: HttpInterceptorFn = (req, next) => {
  const id = crypto.randomUUID();
  return next(req.clone({ setHeaders: { 'X-Correlation-Id': id } }));
};
