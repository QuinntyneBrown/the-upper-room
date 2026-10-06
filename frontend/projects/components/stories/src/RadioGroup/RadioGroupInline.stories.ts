import type { StoryObj } from '@storybook/angular';

import type { TarRadioGroup } from 'components';

export const Inline: StoryObj<TarRadioGroup> = {
  render: () => {
    return {
      props: {
        options: [
          { value: 'public', label: 'Public' },
          { value: 'partners', label: 'Partners only' },
          { value: 'private', label: 'Private' },
        ],
      },
      template: `
      <tar-radio-group label="Event visibility" value="public" [inline]="true" [options]="options" />
    `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          '`inline` adds `.tar-radio-group--inline` and lays the options out in a wrapping row.',
      },
    },
  },
};
