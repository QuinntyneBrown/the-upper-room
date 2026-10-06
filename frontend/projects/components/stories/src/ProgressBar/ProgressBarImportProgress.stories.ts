import { signal } from '@angular/core';
import type { StoryObj } from '@storybook/angular';

import type { TarProgressBar } from 'components';

export const ImportProgress: StoryObj<TarProgressBar> = {
  render: () => {
    const imported = signal(128);
    const total = 320;
    return {
      props: {
        imported,
        total,
        step: () => imported.update((n) => Math.min(total, n + 32)),
        reset: () => imported.set(0),
      },
      template: `
        <div style="display: grid; gap: 12px; max-width: 480px">
          <div style="display: flex; justify-content: space-between" class="mat-body-medium">
            <span>Importing contacts from partners.csv</span>
            <span>{{ imported() }} / {{ total }}</span>
          </div>
          <tar-progress-bar
            mode="determinate"
            [value]="(imported() / total) * 100"
            ariaLabel="Importing contacts"
            testId="contacts-import-progress"
          />
          <div style="display: flex; gap: 8px">
            <tar-button variant="tonal" (clicked)="step()">Import next batch</tar-button>
            <tar-button variant="text" (clicked)="reset()">Restart</tar-button>
          </div>
        </div>
      `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          '`value` is a percentage (0–100). Compute it from your own counts and keep the counts visible as text — the bar alone is not enough for screen-reader or low-vision users.',
      },
    },
  },
};
