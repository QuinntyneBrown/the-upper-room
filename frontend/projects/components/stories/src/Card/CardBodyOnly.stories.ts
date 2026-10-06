import type { StoryObj } from '@storybook/angular';

import type { TarCard } from 'components';

export const BodyOnly: StoryObj<TarCard> = {
  render: () => ({
    template: `
      <tar-card style="max-width: 360px">
        <p style="margin: 0"><strong>3 cities</strong> · 48 partners · 212 contacts</p>
      </tar-card>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'With neither `heading` nor `subheading` the `mat-card-header` is omitted and only `.tar-card__body` renders — useful for summary tiles.',
      },
    },
  },
};
