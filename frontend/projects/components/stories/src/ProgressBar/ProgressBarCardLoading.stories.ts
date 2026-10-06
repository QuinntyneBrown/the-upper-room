import type { StoryObj } from '@storybook/angular';

import type { TarProgressBar } from 'components';

export const CardLoading: StoryObj<TarProgressBar> = {
  render: () => ({
    template: `
      <div
        style="max-width: 420px; border-radius: 12px; overflow: hidden; background: var(--md-sys-color-surface-container); color: var(--md-sys-color-on-surface)"
      >
        <tar-progress-bar ariaLabel="Refreshing upcoming events" />
        <div style="padding: 16px; display: grid; gap: 4px">
          <strong class="mat-title-medium">Upcoming events — Ottawa</strong>
          <span class="mat-body-medium">Refreshing…</span>
        </div>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'Pinned to the top edge of a surface, the indeterminate bar signals a background refresh without blocking the content underneath.',
      },
    },
  },
};
