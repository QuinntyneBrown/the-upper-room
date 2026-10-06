import type { StoryObj } from '@storybook/angular';

import type { TarFormActions } from 'components';

export const Alignment: StoryObj<TarFormActions> = {
  render: () => ({
    template: `
      <div style="display: grid; gap: 8px; max-width: 480px">
        <tar-form-actions saveLabel="Create board" saveType="button" align="end" />
        <tar-form-actions saveLabel="Create board" saveType="button" align="start" />
        <tar-form-actions saveLabel="Create board" saveType="button" align="space-between" />
        <tar-form-actions saveLabel="Save location" saveType="button" [cancelLabel]="null" />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          '`align` is `end` (default), `start` or `space-between`. Set `cancelLabel` to `null` to render Save alone.',
      },
    },
  },
};
