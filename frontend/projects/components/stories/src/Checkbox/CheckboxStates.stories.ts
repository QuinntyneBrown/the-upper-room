import type { StoryObj } from '@storybook/angular';

import type { TarCheckbox } from 'components';

export const States: StoryObj<TarCheckbox> = {
  render: () => ({
    template: `
      <div style="display: grid; gap: 8px">
        <tar-checkbox>Unchecked</tar-checkbox>
        <tar-checkbox [checked]="true">Checked</tar-checkbox>
        <tar-checkbox [indeterminate]="true">Indeterminate</tar-checkbox>
        <tar-checkbox [disabled]="true">Disabled</tar-checkbox>
        <tar-checkbox [checked]="true" [disabled]="true">Checked and disabled</tar-checkbox>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'Unchecked, `checked`, `indeterminate` and `disabled` (which disables the native input).',
      },
    },
  },
};
