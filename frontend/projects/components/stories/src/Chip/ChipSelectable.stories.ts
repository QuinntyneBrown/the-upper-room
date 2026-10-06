import { signal } from '@angular/core';
import type { StoryObj } from '@storybook/angular';

import type { TarChip } from 'components';

export const Selectable: StoryObj<TarChip> = {
  render: () => {
    const upcoming = signal(true);
    const mine = signal(false);
    const online = signal(false);
    return {
      props: { upcoming, mine, online },
      template: `
        <div style="display: grid; gap: 12px">
          <div style="display: flex; flex-wrap: wrap; gap: 8px">
            <tar-chip label="Upcoming" [selectable]="true" [selected]="upcoming()" (selectionChange)="upcoming.set($event)" />
            <tar-chip label="Hosted by me" [selectable]="true" [selected]="mine()" (selectionChange)="mine.set($event)" />
            <tar-chip label="Online" [selectable]="true" [selected]="online()" (selectionChange)="online.set($event)" />
          </div>
          <span class="mat-body-medium">
            Filters: upcoming={{ upcoming() }}, hosted by me={{ mine() }}, online={{ online() }}
          </span>
        </div>
      `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          '`selectable` renders a `mat-chip-option`; `selected` drives its state and `.tar-chip--selected`, and `selectionChange` emits the new boolean. Use selectable chips as filters, e.g. on the events list.',
      },
    },
  },
};
