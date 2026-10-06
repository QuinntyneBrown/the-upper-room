import type { StoryObj } from '@storybook/angular';

import type { TarTextField } from 'components';

export const Appearance: StoryObj<TarTextField> = {
  render: () => ({
    template: `
      <div style="max-width: 420px; display: grid; gap: 16px">
        <tar-text-field label="Event title" value="Spring volunteer orientation" appearance="outline" />
        <tar-text-field label="Event title" value="Spring volunteer orientation" appearance="fill" />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          '`appearance` switches the Material form field between `outline` (the default) and `fill`.',
      },
    },
  },
};
