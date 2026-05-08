// traces_to: L2-074, L2-084
import { Routes } from '@angular/router';
import { Landing } from './landing/landing';
import { Stub } from './stub/stub';
import { EchoTest } from './echo-test/echo-test';
import { AppShell } from './shell/app-shell/app-shell';

export const routes: Routes = [
  { path: '', component: Landing, pathMatch: 'full' },
  {
    path: 'styleguide',
    loadComponent: () => import('./styleguide/styleguide').then((m) => m.Styleguide),
  },
  { path: 'echo-test', component: EchoTest },
  {
    path: '',
    component: AppShell,
    children: [
      { path: 'dashboard-stub', component: Stub },
      { path: 'contacts', component: Stub },
      { path: 'contacts/:id', component: Stub },
      { path: 'contacts/:id/edit', component: Stub },
      { path: 'partners', component: Stub },
      { path: 'partners/:id', component: Stub },
    ],
  },
];
