import type { StoryObj } from '@storybook/angular';

import type { TarProgressBar } from 'components';

export const Modes: StoryObj<TarProgressBar> = {
  render: () => ({
    template: `
      <div style="display: grid; gap: 24px; max-width: 480px">
        <div style="display: grid; gap: 8px">
          <span class="mat-body-medium">determinate — 3 of 5 events published</span>
          <tar-progress-bar mode="determinate" [value]="60" ariaLabel="Publishing events" />
        </div>
        <div style="display: grid; gap: 8px">
          <span class="mat-body-medium">indeterminate — loading partners</span>
          <tar-progress-bar mode="indeterminate" ariaLabel="Loading partners" />
        </div>
        <div style="display: grid; gap: 8px">
          <span class="mat-body-medium">buffer — syncing the Toronto board</span>
          <tar-progress-bar mode="buffer" [value]="35" [bufferValue]="70" ariaLabel="Syncing board" />
        </div>
        <div style="display: grid; gap: 8px">
          <span class="mat-body-medium">query — searching locations</span>
          <tar-progress-bar mode="query" ariaLabel="Searching locations" />
        </div>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "The four `mat-progress-bar` modes. Use `determinate` when you know how far along the work is, `indeterminate` when you don't, `buffer` when content is pre-loading ahead of the playhead (`bufferValue` > `value`) and `query` while a request is being prepared.",
      },
    },
  },
};
