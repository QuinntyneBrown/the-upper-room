// traces_to: L2-084
import { InjectionToken } from '@angular/core';

export interface ITokenStore {
  set(token: string | null): void;
}

export const TOKEN_STORE = new InjectionToken<ITokenStore>('TOKEN_STORE', {
  providedIn: 'root',
  factory: () => ({ set: () => {} }),
});
