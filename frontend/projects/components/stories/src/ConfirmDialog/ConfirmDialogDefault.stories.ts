import type { StoryObj } from '@storybook/angular';

import type { ConfirmOptions } from 'components';

export const Default: StoryObj<ConfirmOptions> = {
  args: {
    title: 'Leave this board?',
    body: 'You will stop getting updates about cards on "Saturday outreach — Toronto".',
    severity: 'info',
    confirmLabel: 'Leave board',
    cancelLabel: 'Stay',
    requireTypedConfirmation: '',
  },
  argTypes: {
    severity: { control: 'inline-radio', options: ['info', 'warning', 'danger'] },
  },
  render: (args) => ({
    props: {
      options: { ...args, requireTypedConfirmation: args.requireTypedConfirmation || undefined },
    },
    template: `<story-confirm-dialog-preview [options]="options" />`,
  }),
};
