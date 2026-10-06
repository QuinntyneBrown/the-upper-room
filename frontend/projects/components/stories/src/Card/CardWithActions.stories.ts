import type { StoryObj } from '@storybook/angular';

import type { TarCard } from 'components';

export const WithActions: StoryObj<TarCard> = {
  render: () => ({
    template: `
      <tar-card style="max-width: 420px" heading="Easter sunrise service" subheading="Sun, Apr 5 · Harbourfront Park" [showActions]="true">
        <p>Outdoor service with three partner churches. 140 people have registered so far.</p>
        <div tar-card-actions>
          <tar-button variant="text">Edit event</tar-button>
          <tar-button variant="tonal" icon="event">Add to calendar</tar-button>
        </div>
      </tar-card>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'Set `showActions` to render `.tar-card__actions` and project an element marked `tar-card-actions` into it. Without `showActions` the actions slot is not rendered at all.',
      },
    },
  },
};
