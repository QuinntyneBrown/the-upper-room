import type { StoryObj } from '@storybook/angular';

import type { TarRelativeTime } from 'components';

export const Default: StoryObj<TarRelativeTime> = {
  args: {
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
  },
  argTypes: {
    timestamp: { control: 'date' },
  },
  render: (args) => ({
    props: args,
    template: `<span style="font: var(--md-sys-typescale-body-medium)">Updated <tar-relative-time [timestamp]="timestamp" /></span>`,
  }),
};
