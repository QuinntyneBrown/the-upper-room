import type { StoryObj } from '@storybook/angular';

import type { TarPageHeader } from 'components';

export const Default: StoryObj<TarPageHeader> = {
  args: {
    title: 'Contacts',
    eyebrow: 'Toronto',
    subtitle: '212 people across 48 partners',
    showBack: false,
    backLabel: 'Back',
    scrolled: false,
    testId: 'contacts-header',
  },
  render: (args) => ({
    props: args,
    template: `<tar-page-header [title]="title" [eyebrow]="eyebrow" [subtitle]="subtitle" [showBack]="showBack" [backLabel]="backLabel" [scrolled]="scrolled" [testId]="testId" />`,
  }),
};
