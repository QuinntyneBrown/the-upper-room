import { signal, type WritableSignal } from '@angular/core';

import {
  TarAvatar,
  TarBadge,
  TarDivider,
  TarIconButton,
  TarList,
  TarMenu,
  TarNavItem,
  TarSideNav,
  TarToolbar,
  type TarMenuItem,
} from 'components';

/** The signed-in member every pattern is drawn for. */
export const SIGNED_IN_USER = {
  displayName: 'Quinn Brown',
  email: 'quinn.brown@theupperroom.org',
  city: 'Toronto',
} as const;

export type NavKey =
  | 'dashboard'
  | 'calendar'
  | 'contacts'
  | 'partners'
  | 'boards'
  | 'ideas'
  | 'events'
  | 'locations'
  | 'users'
  | 'roles'
  | 'tags'
  | 'audit'
  | 'settings';

interface NavEntry {
  readonly key: NavKey;
  readonly label: string;
  readonly icon: string;
  readonly route: string;
  readonly badge?: number;
}

interface NavSection {
  readonly title: string;
  readonly adminOnly?: boolean;
  readonly items: readonly NavEntry[];
}

/** Drawer sections and items in the order L2-010 prescribes. */
export const NAV_SECTIONS: readonly NavSection[] = [
  {
    title: 'Workspace',
    items: [
      { key: 'dashboard', label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
      { key: 'calendar', label: 'Calendar', icon: 'calendar_month', route: '/events' },
    ],
  },
  {
    title: 'People',
    items: [
      { key: 'contacts', label: 'Contacts', icon: 'person', route: '/contacts' },
      { key: 'partners', label: 'Partners', icon: 'domain', route: '/partners' },
    ],
  },
  {
    title: 'Activities',
    items: [
      { key: 'boards', label: 'Kanban Boards', icon: 'view_kanban', route: '/boards', badge: 4 },
      { key: 'ideas', label: 'Hackathon Ideas', icon: 'lightbulb', route: '/ideas' },
      { key: 'events', label: 'Events', icon: 'event', route: '/events' },
      { key: 'locations', label: 'Locations', icon: 'location_on', route: '/locations' },
    ],
  },
  {
    title: 'Admin',
    adminOnly: true,
    items: [
      { key: 'users', label: 'Users', icon: 'group', route: '/admin/users' },
      { key: 'roles', label: 'Roles', icon: 'shield', route: '/admin/users' },
      { key: 'tags', label: 'Tags', icon: 'sell', route: '/admin/tags' },
      { key: 'audit', label: 'Audit Log', icon: 'receipt_long', route: '/admin/audit' },
      { key: 'settings', label: 'Settings', icon: 'settings', route: '/settings/appearance' },
    ],
  },
];

export const ACCOUNT_MENU: readonly TarMenuItem[] = [
  { id: 'profile', label: 'Profile', icon: 'person' },
  { id: 'divider', label: '', divider: true },
  { id: 'sign-out', label: 'Sign out', icon: 'logout' },
];

/** Everything {@link appShell} renders; add to a pattern's `moduleMetadata` imports. */
export const SHELL_IMPORTS = [
  TarToolbar,
  TarIconButton,
  TarBadge,
  TarList,
  TarMenu,
  TarSideNav,
  TarNavItem,
  TarAvatar,
  TarDivider,
];

/** Inline-padding shared by every block inside `<main>`: 16px on phones, 24px from tablet. */
export const GUTTER = 'padding-inline: clamp(var(--md-sys-space-4), 3vw, var(--md-sys-space-6))';

export interface ShellOptions {
  /** Drawer item rendered with the active state. */
  readonly active: NavKey | null;
  /** Markup placed inside `<main>`. */
  readonly content: string;
  /** Phone/tablet shell: menu button in the toolbar and a modal (`over`) drawer. */
  readonly mobile?: boolean;
  /** Render the SystemAdmin-only Admin section. */
  readonly admin?: boolean;
}

export interface ShellProps {
  readonly navOpen: WritableSignal<boolean>;
  readonly accountMenu: readonly TarMenuItem[];
}

/** Story props the shell template binds to. Spread them into a story's own props. */
export function shellProps(navOpen = true): ShellProps {
  return { navOpen: signal(navOpen), accountMenu: ACCOUNT_MENU };
}

/*
 * Nav items sit inside a role-less `tar-list`: `tar-nav-item` renders a bare
 * `mat-list-item`, whose MDC list styles only load with a list container.
 */
function drawerMarkup(active: NavKey | null, admin: boolean): string {
  const sections = NAV_SECTIONS.filter((s) => admin || !s.adminOnly)
    .map(
      (section) => `
        <h2 style="margin: 0; padding: var(--md-sys-space-4) var(--md-sys-space-4) var(--md-sys-space-2); font: var(--md-sys-typescale-label-medium); color: var(--md-sys-color-on-surface-variant)">${section.title}</h2>
        <tar-list [role]="null">
        ${section.items
          .map(
            (item) =>
              `<tar-nav-item label="${item.label}" icon="${item.icon}" routerLink="${item.route}" testId="nav-${item.key}" [active]="${item.key === active}"${item.badge ? ` [badge]="${item.badge}"` : ''} />`,
          )
          .join('\n')}
        </tar-list>
      `,
    )
    .join('\n');

  return `
    <nav tar-side-nav-content aria-label="Primary" style="display: flex; flex-direction: column; min-height: 100%; padding: 0 var(--md-sys-space-3)">
      <div style="display: flex; align-items: center; gap: var(--md-sys-space-3); height: 64px; padding-inline: var(--md-sys-space-1)">
        <tar-avatar [user]="{ displayName: '${SIGNED_IN_USER.displayName}', email: '${SIGNED_IN_USER.email}' }" [size]="40" />
        <div style="display: grid; min-width: 0">
          <span style="font: var(--md-sys-typescale-title-small); color: var(--md-sys-color-on-surface)">${SIGNED_IN_USER.displayName}</span>
          <span style="font: var(--md-sys-typescale-body-small); color: var(--md-sys-color-on-surface-variant)">${SIGNED_IN_USER.city}</span>
        </div>
      </div>
      <tar-divider />
      ${sections}
      <span style="margin-top: auto; padding: var(--md-sys-space-4); font: var(--md-sys-typescale-body-small); color: var(--md-sys-color-on-surface-variant)">Version 2.4.0</span>
    </nav>
  `;
}

/**
 * The signed-in application shell (L2-009 / L2-010): `tar-toolbar` across the
 * top, `tar-side-nav` below it holding the drawer and `<main>`. On desktop the
 * drawer is persistent (`mode="side"`); on phones it is modal (`mode="over"`)
 * and the toolbar's menu button opens it. Requires {@link shellProps}.
 */
export function appShell({ active, content, mobile = false, admin = false }: ShellOptions): string {
  return `
    <div style="display: flex; flex-direction: column; height: 100vh; background: var(--md-sys-color-background); color: var(--md-sys-color-on-background)">
      <tar-toolbar title="The Upper Room" testId="top-bar" [showMenu]="${mobile}" (menuClicked)="navOpen.set(true)">
        <tar-icon-button icon="search" ariaLabel="Search (Ctrl+K)" testId="search-trigger" />
        <span tarBadge="3" tarBadgeSize="small" style="display: inline-flex">
          <tar-icon-button icon="notifications" ariaLabel="Notifications, 3 unread" testId="notification-bell" />
        </span>
        <tar-menu triggerIcon="account_circle" ariaLabel="Account menu" xPosition="before" testId="avatar-menu" [items]="accountMenu" />
      </tar-toolbar>
      <tar-side-nav
        style="flex: 1 1 auto; min-height: 0"
        testId="drawer"
        mode="${mobile ? 'over' : 'side'}"
        [opened]="navOpen()"
        (openedChange)="navOpen.set($event)"
      >
        ${drawerMarkup(active, admin)}
        <main id="main" tabindex="-1" style="display: grid; gap: var(--md-sys-space-4); align-content: start; padding-bottom: var(--md-sys-space-8)">
          ${content}
        </main>
      </tar-side-nav>
    </div>
  `;
}
