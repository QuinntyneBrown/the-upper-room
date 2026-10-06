import type { StoryObj } from '@storybook/angular';

import type { TarShareButton } from 'components';

export const InPageHeader: StoryObj<TarShareButton> = {
  render: () => ({
    template: `
      <header style="display: flex; align-items: center; gap: 8px; max-width: 640px">
        <div style="flex: 1; display: grid">
          <h2 style="margin: 0; font: var(--md-sys-typescale-headline-small)">Toronto spring gathering</h2>
          <span style="font: var(--md-sys-typescale-body-medium); color: var(--md-sys-color-on-surface-variant)">
            Sat, May 16 · St. Lawrence Hall
          </span>
        </div>
        <tar-share-button />
      </header>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'Trailing the title of a detail page (an event, partner or board). It shares the current page URL, so it belongs on pages with a stable, shareable address.',
      },
    },
  },
};
