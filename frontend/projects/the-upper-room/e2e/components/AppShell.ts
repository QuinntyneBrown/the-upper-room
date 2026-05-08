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

  scrim(): Locator {
    return this.page.getByTestId('drawer-scrim');
  }
}
