import type { StoryObj } from '@storybook/angular';

import type { TarNavItem } from 'components';

export const Default: StoryObj<TarNavItem> = {
  args: {
    label: 'Contacts',
    icon: 'contacts',
    routerLink: '/contacts',
    active: false,
    badge: null,
    testId: 'nav-contacts',
  },
  render: (args) => ({
    props: args,
    template: `
      <nav aria-label="Main" style="max-width: 280px">
        <tar-list [role]="null">
          <tar-nav-item [label]="label" [icon]="icon" [routerLink]="routerLink" [active]="active" [badge]="badge" [testId]="testId" />
        </tar-list>
      </nav>
    `,
  }),
};
