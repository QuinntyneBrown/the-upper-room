// traces_to: L2-009..L2-014, L2-021, L2-026
import { Component, HostListener, signal, computed, inject } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TarIconButton, OfflineBanner, breadcrumbsFromUrl, Crumb } from 'components';
import { SignOutService, TarCitySwitcher, TarNotificationBell } from 'domain';
import { GlobalSearch } from '../../search/global-search';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, TarIconButton, OfflineBanner, TarCitySwitcher, TarNotificationBell],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.scss',
})
export class AppShell {
  private readonly router = inject(Router);
  private readonly signOutService = inject(SignOutService);
  private readonly dialog = inject(MatDialog);
  private searchRef: MatDialogRef<GlobalSearch> | null = null;

  protected readonly drawerOpen = signal(false);
  protected readonly avatarMenuOpen = signal(false);
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

  toggleDrawer(): void {
    this.drawerOpen.update((v) => !v);
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
  }

  toggleAvatarMenu(): void {
    this.avatarMenuOpen.update((v) => !v);
  }

  skipToMain(event: Event): void {
    event.preventDefault();
    document.querySelector<HTMLElement>('main')?.focus();
  }

  onSignOut(): void {
    this.avatarMenuOpen.set(false);
    void this.signOutService.signOut();
  }
}
