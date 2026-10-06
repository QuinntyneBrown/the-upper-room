import type { StoryObj } from '@storybook/angular';

import type { ConfirmOptions, TarConfirmDialog } from 'components';

export const TypedConfirmation: StoryObj<TarConfirmDialog> = {
  render: () => {
    const options: ConfirmOptions = {
      title: 'Delete the Hamilton city workspace?',
      body: 'All contacts, partners, events and boards in Hamilton will be deleted.',
      severity: 'danger',
      confirmLabel: 'Delete workspace',
      requireTypedConfirmation: 'Hamilton',
    };
    return { props: { options }, template: `<story-confirm-dialog-preview [options]="options" />` };
  },
  parameters: {
    docs: {
      description: {
        story:
          'With `requireTypedConfirmation`, an outlined text field (`confirm-typed-input`) appears and the confirm button stays disabled until the typed text matches exactly. Try typing "Hamilton".',
      },
    },
  },
};
