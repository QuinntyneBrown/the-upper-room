// traces_to: L2-009..L2-014, L2-021, L2-026
import { Component, HostListener, signal, computed, inject } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { TarIcon } from '../../../../../components/src/lib/icon/icon';
import { breadcrumbsFromUrl, Crumb } from '../breadcrumb.service';
import { OfflineBanner } from '../../network/offline-banner/offline-banner';
import { SignOutService } from '../../auth/sign-out.service';
import { CitySwitcher } from '../../cities/city-switcher/city-switcher';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, TarIcon, OfflineBanner, CitySwitcher],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.scss',
})
export class AppShell {
  private readonly router = inject(Router);
  private readonly signOutService = inject(SignOutService);

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
