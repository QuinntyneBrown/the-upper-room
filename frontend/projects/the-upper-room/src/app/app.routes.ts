// traces_to: L2-074, L2-084, L2-067, L2-068, L2-069, L2-115, L2-016, L2-015, L2-017, L2-024, L2-038, L2-029, L2-032, L2-048
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
import { ForgotPassword } from './auth/forgot-password/forgot-password';
import { ResetPassword } from './auth/reset-password/reset-password';
import { RbacDemo } from './rbac/rbac-demo/rbac-demo';
import { authGuard, permissionGuard, roleGuard } from './rbac/guards';
import { UserList } from './users/user-list/user-list';
import { MyProfile } from './users/my-profile/my-profile';
import { CitiesAdmin } from './cities/cities-admin/cities-admin';
import { TagList } from './tags/tag-list/tag-list';
import { ContactList } from './contacts/contact-list/contact-list';
import { ContactCreate } from './contacts/contact-create/contact-create';
import { ContactDetail } from './contacts/contact-detail/contact-detail';
import { ContactEdit } from './contacts/contact-edit/contact-edit';
import { BoardList } from './kanban/board-list/board-list';
import { BoardView } from './kanban/board-view/board-view';
import { BoardConfigure } from './kanban/board-configure/board-configure';
import { IdeaList } from './ideas/idea-list/idea-list';
import { IdeaDetail } from './ideas/idea-detail/idea-detail';
import { LocationList } from './locations/location-list/location-list';
import { LocationForm } from './locations/location-form/location-form';
import { LocationDetail } from './locations/location-detail/location-detail';
import { AuditLog } from './admin/audit-log/audit-log';
import { NotificationPreferences } from './notifications/notification-preferences/notification-preferences';
import { DateFormattingTest } from './date-formatting-test/date-formatting-test';

export const routes: Routes = [
  { path: '', component: Landing, pathMatch: 'full' },
  {
    path: 'styleguide',
    loadComponent: () => import('./styleguide/styleguide').then((m) => m.Styleguide),
  },
  { path: 'echo-test', component: EchoTest },
  { path: 'forbidden', component: Forbidden },
  { path: '__throw', component: Throw },
  { path: '__rbac-demo', component: RbacDemo },
  { path: 'settings/appearance', component: Appearance },
  { path: 'sign-in', component: SignIn },
  { path: 'sign-up', component: SignUp },
  { path: 'invitations/accept', component: SignUp },
  { path: 'verify-email', component: VerifyEmail },
  { path: 'verify-email/confirm', component: VerifyEmail },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'reset-password', component: ResetPassword },
  { path: 'auth/callback', component: AuthCallback },
  {
    path: '',
    component: AppShell,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: Stub },
      { path: 'dashboard-stub', component: Stub },
      { path: 'contacts', component: ContactList },
      {
        path: 'contacts/new',
        component: ContactCreate,
        canActivate: [permissionGuard],
        data: { permissions: ['Contact:Create'] },
      },
      { path: 'contacts/:id', component: ContactDetail },
      { path: 'contacts/:id/edit', component: ContactEdit },
      { path: 'ideas', component: IdeaList },
      { path: 'ideas/:id', component: IdeaDetail },
      { path: 'locations', component: LocationList },
      { path: 'locations/new', component: LocationForm },
      { path: 'locations/:id', component: LocationDetail },
      { path: 'partners', component: Stub },
      { path: 'partners/:id', component: Stub },
      { path: 'boards', component: BoardList },
      { path: 'boards/:id', component: BoardView },
      {
        path: 'boards/:id/configure',
        component: BoardConfigure,
        canActivate: [permissionGuard],
        data: { permissions: ['KanbanBoard:Configure'] },
      },
      { path: 'profile', component: MyProfile },
      { path: 'settings/notifications', component: NotificationPreferences },
      { path: 'date-formatting-test', component: DateFormattingTest },
      {
        path: 'admin/users',
        component: UserList,
        canActivate: [roleGuard],
        data: { roles: ['SystemAdmin'] },
      },
      {
        path: 'admin/cities',
        component: CitiesAdmin,
        canActivate: [roleGuard],
        data: { roles: ['SystemAdmin'] },
      },
      {
        path: 'admin/tags',
        component: TagList,
        canActivate: [roleGuard],
        data: { roles: ['SystemAdmin'] },
      },
      {
        path: 'admin/audit',
        component: AuditLog,
        canActivate: [roleGuard],
        data: { roles: ['SystemAdmin'] },
      },
    ],
  },
  { path: '**', component: NotFound },
];
