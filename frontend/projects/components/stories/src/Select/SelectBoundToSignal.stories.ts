import { signal } from '@angular/core';
import type { StoryObj } from '@storybook/angular';

import type { TarSelect } from 'components';

export const BoundToSignal: StoryObj<TarSelect> = {
  render: () => {
    const column = signal('in-progress');
    return {
      props: {
        column,
        columns: [
          { value: 'backlog', label: 'Backlog' },
          { value: 'in-progress', label: 'In progress' },
          { value: 'review', label: 'Review' },
          { value: 'done', label: 'Done' },
        ],
      },
      template: `
      <div style="max-width: 360px; display: grid; gap: 8px">
        <tar-select label="Board column" [options]="columns" [value]="column()" (valueChange)="column.set($event)" />
        <span style="color: var(--md-sys-color-on-surface-variant)">Card moves to: <strong>{{ column() }}</strong></span>
      </div>
    `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          'Controlled usage: `[value]` reads a signal and `(valueChange)` writes the selected option value back.',
      },
    },
  },
};
