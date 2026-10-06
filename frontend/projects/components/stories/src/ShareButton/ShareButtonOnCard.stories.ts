import type { StoryObj } from '@storybook/angular';

import type { TarShareButton } from 'components';

export const OnCard: StoryObj<TarShareButton> = {
  render: () => ({
    template: `
      <article
        style="max-width: 360px; padding: 16px; border-radius: var(--md-sys-shape-corner-medium); background: var(--md-sys-color-surface-container); display: grid; gap: 8px"
      >
        <div style="display: flex; align-items: start; gap: 8px">
          <h3 style="flex: 1; margin: 0; font: var(--md-sys-typescale-title-medium)">
            Community garden at Riverside Park
          </h3>
          <tar-share-button />
        </div>
        <p style="margin: 0; font: var(--md-sys-typescale-body-medium); color: var(--md-sys-color-on-surface-variant)">
          Idea · Vancouver · 14 votes
        </p>
      </article>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'On a card header. Remember the button shares `location.href`, not the card — use it on cards only when the page itself is the thing being shared.',
      },
    },
  },
};
