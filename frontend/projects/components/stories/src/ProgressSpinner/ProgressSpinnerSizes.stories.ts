import type { StoryObj } from '@storybook/angular';

import type { TarProgressSpinner } from 'components';

export const Sizes: StoryObj<TarProgressSpinner> = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 24px; align-items: center">
        <tar-progress-spinner [diameter]="20" [strokeWidth]="2" ariaLabel="Saving note" />
        <tar-progress-spinner [diameter]="40" ariaLabel="Loading contacts" />
        <tar-progress-spinner [diameter]="64" [strokeWidth]="6" ariaLabel="Loading Kanban board" />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          '`diameter` (px, default 40) and `strokeWidth` (px, default 4) scale together. 20px fits inline next to text, 40px is the default for a panel, 64px for a full-page load.',
      },
    },
  },
};
