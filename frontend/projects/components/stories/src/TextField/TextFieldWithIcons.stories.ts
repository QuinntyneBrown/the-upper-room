import type { StoryObj } from '@storybook/angular';

import type { TarTextField } from 'components';

export const WithIcons: StoryObj<TarTextField> = {
  render: () => ({
    template: `
      <div style="max-width: 420px; display: grid; gap: 16px">
        <tar-text-field label="Venue" value="Northside Community Hall" prefixIcon="location_on" />
        <tar-text-field label="Website" type="url" value="https://riversidefoodbank.org" suffixIcon="open_in_new" />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          '`prefixIcon` and `suffixIcon` take Material Icons ligatures and render as `.tar-text-field__prefix` / `.tar-text-field__suffix`.',
      },
    },
  },
};
