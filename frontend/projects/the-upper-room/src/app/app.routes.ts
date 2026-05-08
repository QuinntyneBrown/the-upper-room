// traces_to: L2-074, L2-084, L2-067, L2-068, L2-069, L2-115, L2-016, L2-015, L2-017
import { Routes } from '@angular/router';
import { Landing } from './landing/landing';
import { Stub } from './stub/stub';
import { EchoTest } from './echo-test/echo-test';
import { AppShell } from './shell/app-shell/app-shell';
import { NotFound } from './error/not-found/not-found';
import { Forbidden } from './error/forbidden/forbidden';
import { Throw } from './error/throw-route/throw-route';
import { Appearance } from './settings/appearance/appearance';
import { SignIn } from './auth/sign-in/sign-in';
import { AuthCallback } from './auth/auth-callback/auth-callback';
import { SignUp } from './auth/sign-up/sign-up';
import { VerifyEmail } from './auth/verify-email/verify-email';

export const routes: Routes = [
  { path: '', component: Landing, pathMatch: 'full' },
  {
    path: 'styleguide',
    loadComponent: () => import('./styleguide/styleguide').then((m) => m.Styleguide),
  },
  { path: 'echo-test', component: EchoTest },
  { path: 'forbidden', component: Forbidden },
  { path: '__throw', component: Throw },
  { path: 'settings/appearance', component: Appearance },
  { path: 'sign-in', component: SignIn },
  { path: 'sign-up', component: SignUp },
  { path: 'invitations/accept', component: SignUp },
  { path: 'verify-email', component: VerifyEmail },
  { path: 'auth/callback', component: AuthCallback },
  {
    path: '',
    component: AppShell,
    children: [
      { path: 'dashboard', component: Stub },
      { path: 'dashboard-stub', component: Stub },
      { path: 'contacts', component: Stub },
      { path: 'contacts/:id', component: Stub },
      { path: 'contacts/:id/edit', component: Stub },
      { path: 'partners', component: Stub },
      { path: 'partners/:id', component: Stub },
    ],
  },
  { path: '**', component: NotFound },
];
