// traces_to: L2-074
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'styleguide',
    loadComponent: () => import('./styleguide/styleguide').then((m) => m.Styleguide),
  },
];
