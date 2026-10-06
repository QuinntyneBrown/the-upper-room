import { signal } from '@angular/core';
import type { StoryObj } from '@storybook/angular';

import type { TarTab, TarTabs } from 'components';

const TABS: readonly TarTab[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'contacts', label: 'Contacts' },
  { id: 'events', label: 'Events' },
  { id: 'locations', label: 'Locations' },
];

export const Controlled: StoryObj<TarTabs> = {
  render: () => {
    const index = signal(1);
    return {
      props: { tabs: TABS, index, select: (i: number) => index.set(i) },
      template: `
        <tar-tabs [tabs]="tabs" [selectedIndex]="index()" testId="partner" (selectedIndexChange)="select($event)">
          <ng-template let-tab>
            <p>{{ tab.label }} for Grace Community Church.</p>
          </ng-template>
        </tar-tabs>
        <p>Selected index: {{ index() }} ({{ tabs[index()].id }})</p>
      `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          'Detail pages bind `selectedIndex` from state (e.g. a query parameter) and write back on `selectedIndexChange`, so the selected tab survives reloads.',
      },
    },
  },
};
