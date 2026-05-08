// traces_to: L2-028
import { Page, Locator } from '@playwright/test';

export class UserDetailDrawer {
  constructor(private readonly page: Page) {}

  root(): Locator {
    return this.page.getByTestId('user-drawer');
  }

  name(): Locator {
    return this.page.getByTestId('user-drawer-name');
  }

  status(): Locator {
    return this.page.getByTestId('user-drawer-status');
  }

  disable(): Locator {
    return this.page.getByTestId('user-drawer-disable');
  }

  delete(): Locator {
    return this.page.getByTestId('user-drawer-delete');
  }

  changeRole(): Locator {
    return this.page.getByTestId('user-drawer-role-select');
  }

  resetPassword(): Locator {
    return this.page.getByTestId('user-drawer-reset-password');
  }
}
