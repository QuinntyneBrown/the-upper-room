import type { StoryObj } from '@storybook/angular';

import type { ConfirmOptions, TarConfirmDialog } from 'components';

export const Warning: StoryObj<TarConfirmDialog> = {
  render: () => {
    const options: ConfirmOptions = {
      title: 'Cancel the Ottawa volunteer fair?',
      body: '42 attendees will be notified that the event is cancelled.',
      severity: 'warning',
      confirmLabel: 'Cancel event',
      cancelLabel: 'Keep event',
    };
    return { props: { options }, template: `<story-confirm-dialog-preview [options]="options" />` };
  },
  parameters: {
    docs: {
      description: {
        story:
          '`severity: \'warning\'` uses the tertiary-container colour roles — for reversible actions with side effects. Custom `confirmLabel`/`cancelLabel` replace "Confirm"/"Cancel".',
      },
    },
  },
};
