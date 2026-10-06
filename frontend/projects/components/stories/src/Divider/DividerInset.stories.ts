import type { StoryObj } from '@storybook/angular';

import type { TarDivider } from 'components';

export const Inset: StoryObj<TarDivider> = {
  render: () => ({
    template: `
      <div style="max-width: 420px; display: grid; gap: 12px">
        <span>Toronto</span>
        <tar-divider [inset]="true" />
        <span>Hamilton</span>
        <tar-divider [inset]="true" />
        <span>Ottawa</span>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          '`inset` adds `.mat-divider-inset`, indenting the rule from the start edge (Material uses this to line up with list text after a leading icon or avatar).',
      },
    },
  },
};
