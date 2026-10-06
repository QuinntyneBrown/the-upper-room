import type { StoryObj } from '@storybook/angular';

import type { TarTabs } from 'components';

export const Default: StoryObj<TarTabs> = {
  args: {
    tabs: [
      { id: 'overview', label: 'Overview' },
      { id: 'notes', label: 'Notes' },
      { id: 'events', label: 'Events' },
    ],
    selectedIndex: 0,
    testId: 'contact',
  },
  render: (args) => ({
    props: args,
    template: `
      <tar-tabs [tabs]="tabs" [selectedIndex]="selectedIndex" [testId]="testId">
        <ng-template let-tab>
          @switch (tab.id) {
            @case ('overview') { <p>Amara Okafor · Volunteer coordinator, Toronto</p> }
            @case ('notes') { <p>Prefers to be contacted by email. Available on weekends.</p> }
            @default { <p>Attending the prayer breakfast on Sat, Oct 10.</p> }
          }
        </ng-template>
      </tar-tabs>
    `,
  }),
};
