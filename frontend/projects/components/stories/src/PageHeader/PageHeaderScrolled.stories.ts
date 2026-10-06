import type { StoryObj } from '@storybook/angular';

import type { TarPageHeader } from 'components';

export const Scrolled: StoryObj<TarPageHeader> = {
  render: () => ({
    template: `
      <div style="padding-bottom: 24px">
        <tar-page-header title="Kanban boards" subtitle="Scrolled state" [scrolled]="true" />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          '`scrolled` adds `.tar-page-header--scrolled`, a level-1 elevation shadow that separates the header from content scrolling underneath. The page sets it from its own scroll position.',
      },
    },
  },
};
