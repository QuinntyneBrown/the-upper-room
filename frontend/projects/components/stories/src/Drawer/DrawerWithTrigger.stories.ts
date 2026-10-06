import { signal } from '@angular/core';
import type { StoryObj } from '@storybook/angular';

import type { TarDrawer } from 'components';

export const WithTrigger: StoryObj<TarDrawer> = {
  render: () => {
    const open = signal(false);
    return {
      props: { open, show: () => open.set(true), hide: () => open.set(false) },
      template: `
        <div style="padding: 24px">
          <tar-button variant="tonal" icon="filter_list" (clicked)="show()">Filter events</tar-button>
        </div>
        <tar-drawer title="Filter events" ariaLabel="Filter events" testId="event-filter-drawer" [open]="open()" (closed)="hide()">
          <p style="margin-top: 0">City: Toronto, Hamilton</p>
          <p>Date: next 30 days</p>
          <p>Location: any</p>
          <div tar-drawer-footer>
            <tar-button variant="text" (clicked)="hide()">Cancel</tar-button>
            <tar-button (clicked)="hide()">Apply filters</tar-button>
          </div>
        </tar-drawer>
      `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          'The drawer is controlled: it emits `closed` from the close button, the scrim (when `closeOnScrim`) and the Escape key, and the host sets `open` to false.',
      },
    },
  },
};
