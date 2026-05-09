// traces_to: L2-015
import { InjectionToken } from '@angular/core';

export interface IdpConfig {
  readonly authorizeUrl: string;
  readonly clientId: string;
  readonly redirectUri: string;
}

export const IDP_CONFIG = new InjectionToken<IdpConfig>('IDP_CONFIG', {
  factory: () => ({
    authorizeUrl: '/__idp/authorize',
    clientId: 'the-upper-room',
    redirectUri: `${window.location.origin}/auth/callback`,
  }),
});
