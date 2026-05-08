// traces_to: L2-084
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ACCESS_TOKEN_SOURCE } from '../services/access-token.contract';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(ACCESS_TOKEN_SOURCE).current();
  if (!token) return next(req);
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
