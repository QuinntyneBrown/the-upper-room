// traces_to: L2-084
import { InjectionToken } from '@angular/core';

export interface AccessTokenSource {
  current(): string | null;
}

export const ACCESS_TOKEN_SOURCE = new InjectionToken<AccessTokenSource>('ACCESS_TOKEN_SOURCE', {
  providedIn: 'root',
  factory: () => ({ current: () => null }),
});
