// traces_to: L2-009..L2-014
import { Page, Locator } from '@playwright/test';

export class AppShell {
  constructor(private readonly page: Page) {}

  topBar(): Locator {
    return this.page.getByTestId('top-bar');
  }

  drawer(): Locator {
    return this.page.getByTestId('drawer');
  }

  drawerToggle(): Locator {
    return this.page.getByTestId('drawer-toggle');
  }

  breadcrumbs(): Locator {
    return this.page.getByTestId('breadcrumbs');
  }

  footer(): Locator {
    return this.page.getByTestId('footer');
  }

  skipLink(): Locator {
    return this.page.getByTestId('skip-link');
  }

  avatarTrigger(): Locator {
    return this.page.getByTestId('avatar-trigger');
  }

  signOutMenuItem(): Locator {
    return this.page.getByTestId('avatar-menu-sign-out');
  }

  navItem(name: string): Locator {
    return this.drawer()
      .locator('a.tar-nav-item')
      .filter({ has: this.page.getByText(name, { exact: true }) });
  }

  navSection(name: string): Locator {
    return this.drawer().locator('.app-shell__nav-title').filter({ hasText: new RegExp(`^${name}$`) });
  }

  activeNavItems(): Locator {
    return this.drawer().locator('.tar-nav-item--active');
  }

  scrim(): Locator {
    return this.page.getByTestId('drawer-scrim');
  }
}
