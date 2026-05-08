// traces_to: L2-023, L2-025
import { InjectionToken } from '@angular/core';

export interface IMeBootstrap {
  load(): void;
}

export const ME_BOOTSTRAP = new InjectionToken<IMeBootstrap>('ME_BOOTSTRAP');
