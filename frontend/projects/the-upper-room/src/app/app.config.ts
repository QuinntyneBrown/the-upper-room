// traces_to: L2-084, L2-069, L2-115, L2-016, L2-015, L2-096
import { ApplicationConfig, ErrorHandler, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideApi } from 'api';
import { provideTarComponents } from 'components';
import { provideDomain } from 'domain';

import { routes } from './app.routes';
import { correlationIdInterceptor } from './interceptors/correlation-id.interceptor';
import { authInterceptor } from './interceptors/auth.interceptor';
import { csrfInterceptor } from './interceptors/csrf.interceptor';
import { retryInterceptor } from './interceptors/retry.interceptor';
import { errorInterceptor } from './interceptors/error.interceptor';
import { GlobalErrorHandler } from './error/global-error-handler';
import { ACCESS_TOKEN_SOURCE } from './services/access-token.contract';
import { AUTH_PROVIDER } from './auth/auth-provider.contract';
import { PkceAuthProvider } from './auth/pkce-auth-provider';
import { AccessTokenStore } from './auth/access-token-store';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        correlationIdInterceptor,
        authInterceptor,
        csrfInterceptor,
        retryInterceptor,
        errorInterceptor,
      ]),
    ),
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    { provide: ACCESS_TOKEN_SOURCE, useExisting: AccessTokenStore },
    { provide: AUTH_PROVIDER, useExisting: PkceAuthProvider },
    provideApi(),
    provideTarComponents(),
    provideDomain(),
  ],
};
