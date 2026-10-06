import type { StoryObj } from '@storybook/angular';

import type { TarToolbar } from 'components';

export const Scrolled: StoryObj<TarToolbar> = {
  render: () => ({
    template: `
      <div style="padding-bottom: 24px">
        <tar-toolbar title="The Upper Room" [showMenu]="true" [scrolled]="true" />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          '`scrolled` adds `.tar-toolbar--scrolled` (level-2 elevation). The host is `position: sticky; top: 0`, so the shadow separates it from content scrolling beneath.',
      },
    },
  },
};
