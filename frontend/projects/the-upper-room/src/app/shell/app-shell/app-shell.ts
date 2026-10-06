// traces_to: L2-009..L2-014, L2-021, L2-026
import { Component, HostListener, signal, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import {
  TarIconButton,
  TarNavItem,
  OfflineBanner,
  breadcrumbsFromUrl,
  Crumb,
} from 'components';
import {
  HasRoleDirective,
  SIGN_OUT_SERVICE,
  TarCitySwitcher,
  TarNotificationBell,
} from 'domain';
import { GlobalSearch } from '../../search/global-search';

interface NavEntry {
  readonly label: string;
  readonly icon: string;
  readonly route: string;
  readonly testId: string;
}

interface NavSection {
  readonly title: string;
  readonly roles?: readonly string[];
  readonly items: readonly NavEntry[];
}

const NAV_SECTIONS: readonly NavSection[] = [
  {
    title: 'Workspace',
    items: [{ label: 'Dashboard', icon: 'dashboard', route: '/dashboard', testId: 'nav-dashboard' }],
  },
  {
    title: 'People',
    items: [
      { label: 'Contacts', icon: 'person', route: '/contacts', testId: 'nav-contacts' },
      { label: 'Partners', icon: 'domain', route: '/partners', testId: 'nav-partners' },
    ],
  },
  {
    title: 'Activities',
    items: [
      { label: 'Kanban Boards', icon: 'view_kanban', route: '/boards', testId: 'nav-boards' },
      { label: 'Hackathon Ideas', icon: 'lightbulb', route: '/ideas', testId: 'nav-ideas' },
      { label: 'Events', icon: 'event', route: '/events', testId: 'nav-events' },
      { label: 'Locations', icon: 'location_on', route: '/locations', testId: 'nav-locations' },
    ],
  },
  {
    title: 'Admin',
    roles: ['SystemAdmin'],
    items: [
      { label: 'Users', icon: 'group', route: '/admin/users', testId: 'nav-admin-users' },
      { label: 'Cities', icon: 'location_city', route: '/admin/cities', testId: 'nav-admin-cities' },
      { label: 'Tags', icon: 'sell', route: '/admin/tags', testId: 'nav-admin-tags' },
      { label: 'Audit Log', icon: 'receipt_long', route: '/admin/audit', testId: 'nav-admin-audit' },
    ],
  },
];

@Component({
  selector: 'app-shell',
  imports: [
    RouterOutlet,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    TarIconButton,
    TarNavItem,
    HasRoleDirective,
    OfflineBanner,
    TarCitySwitcher,
    TarNotificationBell,
  ],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.scss',
})
export class AppShell {
  private readonly router = inject(Router);
  private readonly signOutService = inject(SIGN_OUT_SERVICE);
  private readonly dialog = inject(MatDialog);
  private searchRef: MatDialogRef<GlobalSearch> | null = null;

  protected readonly sections = NAV_SECTIONS;
  protected readonly drawerOpen = signal(false);
  protected readonly scrolled = signal(false);
  protected readonly url = signal(this.router.url);
  protected readonly crumbs = computed<Crumb[]>(() => breadcrumbsFromUrl(this.url()));

  constructor() {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => this.url.set(e.urlAfterRedirects));
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 200);
  }

  @HostListener('window:keydown', ['$event'])
  onGlobalKeydown(e: KeyboardEvent): void {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      this.openSearch();
    }
    if (e.key === 'Escape' && this.drawerOpen()) {
      this.closeDrawer();
    }
  }

  private openSearch(): void {
    if (this.searchRef) return;
    this.searchRef = this.dialog.open(GlobalSearch, {
      panelClass: 'tar-global-search-panel',
      position: { top: '64px' },
      autoFocus: false,
    });
    this.searchRef.afterClosed().subscribe(() => (this.searchRef = null));
  }

  protected isActive(route: string): boolean {
    const path = this.url().split(/[?#]/)[0];
    return path === route || path.startsWith(route + '/');
  }

  toggleDrawer(): void {
    this.drawerOpen.update((v) => !v);
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
  }

  skipToMain(event: Event): void {
    event.preventDefault();
    document.querySelector<HTMLElement>('main')?.focus();
  }

  onSignOut(): void {
    void this.signOutService.signOut();
  }
}
