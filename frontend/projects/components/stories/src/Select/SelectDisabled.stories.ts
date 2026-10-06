import type { StoryObj } from '@storybook/angular';

import type { TarSelect } from 'components';

export const Disabled: StoryObj<TarSelect> = {
  render: () => {
    return {
      props: {
        cities: [
          { value: 'toronto', label: 'Toronto' },
          { value: 'ottawa', label: 'Ottawa' },
          { value: 'montreal', label: 'Montréal' },
          { value: 'halifax', label: 'Halifax', disabled: true },
        ],
      },
      template: `
      <div style="max-width: 360px">
        <tar-select label="City" value="ottawa" [disabled]="true" [options]="cities" />
      </div>
    `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          '`disabled` disables the whole `mat-select`; a single option is disabled with `disabled: true` on its `TarSelectOption` (Halifax in the Default story).',
      },
    },
  },
};
