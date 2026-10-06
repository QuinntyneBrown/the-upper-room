import { signal } from '@angular/core';
import type { StoryObj } from '@storybook/angular';

import type { TarChipOption, TarChipSet } from 'components';

export const SingleSelect: StoryObj<TarChipSet> = {
  render: () => {
    const status = signal<string>('active');
    const options: TarChipOption[] = [
      { value: 'active', label: 'Active' },
      { value: 'prospect', label: 'Prospect' },
      { value: 'lapsed', label: 'Lapsed' },
    ];
    return {
      props: { status, options },
      template: `
        <div style="display: grid; gap: 12px">
          <tar-chip-set
            [single]="true"
            [value]="status()"
            [options]="options"
            ariaLabel="Partner status"
            (valueChange)="status.set($event)"
          />
          <span class="mat-body-medium">Showing {{ status() }} partners</span>
        </div>
      `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          'With `single`, the set renders a `mat-chip-listbox` of `mat-chip-option`s built from `options`. `value` marks the selected option and `valueChange` emits the newly selected value — keep it in a signal.',
      },
    },
  },
};
