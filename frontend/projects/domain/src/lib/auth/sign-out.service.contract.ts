import { InjectionToken } from '@angular/core';

export interface ISignOutService {
  signOut(): Promise<void>;
  forceSignOut(): void;
}

export const SIGN_OUT_SERVICE = new InjectionToken<ISignOutService>('SIGN_OUT_SERVICE');
