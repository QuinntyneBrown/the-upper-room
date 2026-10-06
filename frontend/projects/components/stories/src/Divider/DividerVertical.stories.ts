import type { StoryObj } from '@storybook/angular';

import type { TarDivider } from 'components';

export const Vertical: StoryObj<TarDivider> = {
  render: () => ({
    template: `
      <div style="display: flex; align-items: stretch; gap: 16px; height: 32px">
        <span style="align-self: center">48 partners</span>
        <tar-divider [vertical]="true" />
        <span style="align-self: center">212 contacts</span>
        <tar-divider [vertical]="true" />
        <span style="align-self: center">9 events this month</span>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          '`vertical` turns the rule into a `.mat-divider-vertical` line; it fills the height of a flex row with `align-items: stretch`.',
      },
    },
  },
};
