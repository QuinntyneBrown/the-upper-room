import type { StoryObj } from '@storybook/angular';

import type { TarIconButton } from 'components';

export const Disabled: StoryObj<TarIconButton> = {
  render: () => ({
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: center">
        <tar-icon-button icon="edit" ariaLabel="Edit board" />
        <tar-icon-button icon="edit" ariaLabel="Edit board" [disabled]="true" />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          '`disabled` sets the native `disabled` attribute on the inner `<button>`; it no longer emits `clicked`.',
      },
    },
  },
};
