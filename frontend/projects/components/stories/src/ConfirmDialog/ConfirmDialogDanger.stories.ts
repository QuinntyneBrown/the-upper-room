import type { StoryObj } from '@storybook/angular';

import type { ConfirmOptions, TarConfirmDialog } from 'components';

export const Danger: StoryObj<TarConfirmDialog> = {
  render: () => {
    const options: ConfirmOptions = {
      title: 'Delete this contact?',
      body: "Maya Okafor and her notes will be permanently removed. This can't be undone.",
      severity: 'danger',
      confirmLabel: 'Delete contact',
    };
    return { props: { options }, template: `<story-confirm-dialog-preview [options]="options" />` };
  },
  parameters: {
    docs: {
      description: {
        story:
          '`severity: \'danger\'` sets `data-severity="danger"` on the host, which paints it with the error-container colour roles. Use it for irreversible actions.',
      },
    },
  },
};
