import type { StoryObj } from '@storybook/angular';

import type { TarToolbar } from 'components';

export const Default: StoryObj<TarToolbar> = {
  args: {
    title: 'The Upper Room',
    showMenu: true,
    menuAriaLabel: 'Open navigation',
    scrolled: false,
    testId: 'app-toolbar',
  },
  render: (args) => ({
    props: args,
    template: `
      <tar-toolbar [title]="title" [showMenu]="showMenu" [menuAriaLabel]="menuAriaLabel" [scrolled]="scrolled" [testId]="testId">
        <tar-icon-button icon="search" ariaLabel="Search" />
      </tar-toolbar>
    `,
  }),
};
