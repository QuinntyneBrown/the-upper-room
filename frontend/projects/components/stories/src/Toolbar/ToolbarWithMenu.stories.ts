import { signal } from '@angular/core';
import type { StoryObj } from '@storybook/angular';

import type { TarToolbar } from 'components';

export const WithMenu: StoryObj<TarToolbar> = {
  render: () => {
    const opens = signal(0);
    return {
      props: { opens, open: () => opens.update((n) => n + 1) },
      template: `
        <tar-toolbar title="Toronto" [showMenu]="true" testId="app-toolbar" (menuClicked)="open()" />
        <p style="padding: 0 16px">Menu opened {{ opens() }} times</p>
      `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          '`showMenu` renders a leading `menu` icon button (`.tar-toolbar__menu`, `data-testid="{testId}-menu"`, `aria-label` from `menuAriaLabel`) that emits `menuClicked` — the shell uses it to toggle `tar-side-nav` on small screens.',
      },
    },
  },
};
