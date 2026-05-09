/*
 * Public API Surface of domain
 *
 * UI components, directives, and services that depend on the `api` library.
 * Services follow the contract+token pattern: each service exposes an
 * interface (`I*`) and an `InjectionToken<I*>`; the concrete class is bound
 * to the token via `provideDomain()`. Consumers inject the token, never the
 * concrete class.
 */

export * from './lib/provide-domain';

// RBAC
export * from './lib/rbac/rbac-snapshot';
export * from './lib/rbac/permissions.contract';
export * from './lib/rbac/permissions.service';
export * from './lib/rbac/has-permission.directive';
export * from './lib/rbac/has-role.directive';
export * from './lib/rbac/guards';

// Bootstrap
export * from './lib/bootstrap/me-bootstrap.contract';
export * from './lib/bootstrap/me-bootstrap';

// Users
export * from './lib/users/invite-user-dialog/invite-user-dialog';
export * from './lib/users/user-detail-drawer/user-detail-drawer';

// Theme
export * from './lib/theme/theme.service';

// Tags
export * from './lib/tags/tag.model';
export * from './lib/tags/tag-selector/tar-tag-selector';

// Auth
export * from './lib/auth/access-token-source.contract';
export * from './lib/auth/token-store.contract';
export * from './lib/auth/sign-out.service';
export * from './lib/auth/idle.service';
export * from './lib/auth/inactivity-dialog/inactivity-dialog';

// Cities
export * from './lib/cities/city-scope.service';
export * from './lib/cities/city-switcher/tar-city-switcher';

// Notifications
export * from './lib/notifications/notification-bell/tar-notification-bell';
export * from './lib/notifications/notification-preferences/tar-notification-preferences';
