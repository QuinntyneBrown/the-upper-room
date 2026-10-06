import type { StoryObj } from '@storybook/angular';

import type { TarBanner } from 'components';

export const Default: StoryObj<TarBanner> = {
  args: {
    message: 'Hamilton was added as a new city. Invite a city lead to get started.',
    severity: 'info',
    icon: 'info',
    actionLabel: 'Invite lead',
    dismissible: true,
    dismissLabel: 'Dismiss',
    visible: true,
    testId: 'city-banner',
  },
  render: (args) => ({
    props: args,
    template: `<tar-banner [message]="message" [severity]="severity" [icon]="icon" [actionLabel]="actionLabel" [dismissible]="dismissible" [dismissLabel]="dismissLabel" [visible]="visible" [testId]="testId" />`,
  }),
};
