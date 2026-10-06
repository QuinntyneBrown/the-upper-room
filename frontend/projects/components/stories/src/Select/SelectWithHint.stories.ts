import type { StoryObj } from '@storybook/angular';

import type { TarSelect } from 'components';

export const WithHint: StoryObj<TarSelect> = {
  render: () => {
    return {
      props: {
        types: [
          { value: 'nonprofit', label: 'Non-profit' },
          { value: 'business', label: 'Business' },
          { value: 'faith', label: 'Faith community' },
          { value: 'government', label: 'Government' },
        ],
      },
      template: `
      <div style="max-width: 360px">
        <tar-select label="Partner type" value="nonprofit" hint="Used to group partners on the dashboard." [options]="types" />
      </div>
    `,
    };
  },
  parameters: {
    docs: { description: { story: '`hint` renders under the field as `.tar-select__hint`.' } },
  },
};
