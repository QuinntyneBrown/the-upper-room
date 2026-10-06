import type { StoryObj } from '@storybook/angular';

import type { TarCard } from 'components';

export const Appearance: StoryObj<TarCard> = {
  render: () => ({
    template: `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px">
        <tar-card appearance="filled" heading="Filled" subheading="Default">
          <p>Youth night at the Riverside location, Friday 7 pm.</p>
        </tar-card>
        <tar-card appearance="outlined" heading="Outlined" subheading="appearance=&quot;outlined&quot;">
          <p>Youth night at the Riverside location, Friday 7 pm.</p>
        </tar-card>
        <tar-card appearance="raised" heading="Raised" subheading="appearance=&quot;raised&quot;">
          <p>Youth night at the Riverside location, Friday 7 pm.</p>
        </tar-card>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          '`appearance` is passed straight to `mat-card`. All three share the `surface-container` background from `.tar-card`; `outlined` adds a border and `raised` adds elevation.',
      },
    },
  },
};
