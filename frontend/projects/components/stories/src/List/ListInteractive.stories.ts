import { signal } from '@angular/core';
import type { StoryObj } from '@storybook/angular';

import type { TarList } from 'components';

export const Interactive: StoryObj<TarList> = {
  render: () => {
    const selected = signal('toronto');
    return {
      props: { selected, select: (id: string) => selected.set(id) },
      template: `
        <tar-list style="max-width: 360px" ariaLabel="Cities">
          <tar-list-item icon="location_city" title="Toronto" description="124 contacts" [interactive]="true" [active]="selected() === 'toronto'" testId="city-toronto" (clicked)="select('toronto')" />
          <tar-list-item icon="location_city" title="Hamilton" description="58 contacts" [interactive]="true" [active]="selected() === 'hamilton'" testId="city-hamilton" (clicked)="select('hamilton')" />
          <tar-list-item icon="location_city" title="Ottawa" description="30 contacts" [interactive]="true" [active]="selected() === 'ottawa'" testId="city-ottawa" (clicked)="select('ottawa')" />
        </tar-list>
      `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          '`interactive` renders the item as an `<a mat-list-item>` with `.tar-list-item--interactive` and emits `clicked`. `active` adds `.tar-list-item--active` (secondary-container background) — the host keeps track of which item is selected.',
      },
    },
  },
};
