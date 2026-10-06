import type { StoryObj } from '@storybook/angular';

import type { TarProgressSpinner } from 'components';

export const InlineLoading: StoryObj<TarProgressSpinner> = {
  render: () => ({
    template: `
      <div
        style="display: flex; gap: 12px; align-items: center; color: var(--md-sys-color-on-surface-variant)"
        class="mat-body-medium"
      >
        <tar-progress-spinner [diameter]="24" [strokeWidth]="3" ariaLabel="Loading partners in Montréal" />
        <span>Loading partners in Montréal…</span>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'A small spinner next to a status line, for panels that load independently of the page around them.',
      },
    },
  },
};
