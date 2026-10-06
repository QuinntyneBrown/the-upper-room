import type { StoryObj } from '@storybook/angular';

import type { TarProgressSpinner } from 'components';

export const Determinate: StoryObj<TarProgressSpinner> = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 32px; align-items: center">
        <div style="display: grid; gap: 8px; justify-items: center" class="mat-body-medium">
          <tar-progress-spinner mode="determinate" [value]="25" ariaLabel="Uploading venue photos" />
          <span>25%</span>
        </div>
        <div style="display: grid; gap: 8px; justify-items: center" class="mat-body-medium">
          <tar-progress-spinner mode="determinate" [value]="60" ariaLabel="Uploading venue photos" />
          <span>60%</span>
        </div>
        <div style="display: grid; gap: 8px; justify-items: center" class="mat-body-medium">
          <tar-progress-spinner mode="determinate" [value]="90" ariaLabel="Uploading venue photos" />
          <span>90%</span>
        </div>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'In `determinate` mode the arc length follows `value` (0–100) — for example, uploading photos for a location.',
      },
    },
  },
};
