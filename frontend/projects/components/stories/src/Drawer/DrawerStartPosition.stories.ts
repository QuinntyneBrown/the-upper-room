import type { StoryObj } from '@storybook/angular';

import type { TarDrawer } from 'components';

export const StartPosition: StoryObj<TarDrawer> = {
  render: () => ({
    template: `
      <tar-drawer [open]="true" position="start" title="Cities" ariaLabel="Choose a city">
        <p style="margin-top: 0">Toronto · 124 contacts</p>
        <p>Hamilton · 58 contacts</p>
        <p>Ottawa · 30 contacts</p>
      </tar-drawer>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          '`position="start"` adds `.tar-drawer--start` and anchors the panel to the left edge. With no footer content, `.tar-drawer__footer` collapses (it is styled only when `:not(:empty)`).',
      },
    },
  },
};
