import type { StoryObj } from '@storybook/angular';

import type { TarTabs } from 'components';

export const DisabledTab: StoryObj<TarTabs> = {
  render: () => ({
    props: {
      tabs: [
        { id: 'board', label: 'Board' },
        { id: 'members', label: 'Members' },
        { id: 'archive', label: 'Archive', disabled: true },
      ],
    },
    template: `
      <tar-tabs [tabs]="tabs">
        <ng-template let-tab>
          <p>{{ tab.label }} — Summer camp planning</p>
        </ng-template>
      </tar-tabs>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: 'A tab with `disabled: true` is shown but cannot be selected.',
      },
    },
  },
};
