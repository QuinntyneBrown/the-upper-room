import type { StoryObj } from '@storybook/angular';

import type { TarButton } from 'components';

export const Variant: StoryObj<TarButton> = {
  render: () => ({
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 12px; align-items: center">
        <tar-button variant="filled">Filled</tar-button>
        <tar-button variant="tonal">Tonal</tar-button>
        <tar-button variant="outlined">Outlined</tar-button>
        <tar-button variant="elevated">Elevated</tar-button>
        <tar-button variant="text">Text</tar-button>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'The five Material 3 emphasis levels. `filled` is the one primary action per view; `tonal` and `outlined` are secondary; `elevated` lifts off busy surfaces; `text` is the lowest emphasis (Cancel, inline actions).',
      },
    },
  },
};
