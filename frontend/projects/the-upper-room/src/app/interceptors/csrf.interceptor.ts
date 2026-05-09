// traces_to: L2-096
import { HttpInterceptorFn } from '@angular/common/http';
import { inject, DOCUMENT } from '@angular/core';

const XSRF_COOKIE = 'XSRF-TOKEN';
const XSRF_HEADER = 'X-XSRF-TOKEN';
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function readCookie(name: string, doc: Document): string | null {
  const match = doc.cookie.split(';').map((c) => c.trim()).find((c) => c.startsWith(name + '='));
  return match ? decodeURIComponent(match.split('=').slice(1).join('=')) : null;
}

export const csrfInterceptor: HttpInterceptorFn = (req, next) => {
  const doc = inject(DOCUMENT);
  if (SAFE_METHODS.has(req.method)) return next(req);
  const token = readCookie(XSRF_COOKIE, doc);
  if (!token) return next(req);
  return next(req.clone({ setHeaders: { [XSRF_HEADER]: token } }));
};
