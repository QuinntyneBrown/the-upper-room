import type { StoryObj } from '@storybook/angular';

import type { TarButton } from 'components';

export const States: StoryObj<TarButton> = {
  render: () => ({
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 12px; align-items: center">
        <tar-button [disabled]="true">Disabled</tar-button>
        <tar-button [loading]="true">Saving…</tar-button>
        <tar-button variant="outlined" [disabled]="true">Disabled</tar-button>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: '`disabled` and `loading` both set the native `disabled` attribute on the inner `<button>`.',
      },
    },
  },
};
