import type { StoryObj } from '@storybook/angular';

import type { TarChip } from 'components';

export const Disabled: StoryObj<TarChip> = {
  render: () => ({
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 8px">
        <tar-chip label="Archived" [disabled]="true" />
        <tar-chip label="Past events" [selectable]="true" [disabled]="true" />
        <tar-chip label="Founding partner" [removable]="true" [disabled]="true" />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          '`disabled` is forwarded to the underlying `mat-chip` / `mat-chip-option` in every mode.',
      },
    },
  },
};
