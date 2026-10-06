import type { StoryObj } from '@storybook/angular';

import type { TarDivider } from 'components';

export const Default: StoryObj<TarDivider> = {
  args: {
    vertical: false,
    inset: false,
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="max-width: 480px; display: flex; flex-direction: column; gap: 12px">
        <span>Contact details</span>
        <tar-divider [vertical]="vertical" [inset]="inset" />
        <span>Notes</span>
      </div>
    `,
  }),
};
