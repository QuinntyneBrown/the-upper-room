import { signal } from '@angular/core';
import type { StoryObj } from '@storybook/angular';

import { appShell, shellProps } from '../shared/shell';
import { dashboardMarkup } from './dashboard';

export const NotificationsPanel: StoryObj = {
  name: 'Notifications panel',
  render: () => ({
    props: { ...shellProps(true), panelOpen: signal(true) },
    // The drawer is a sibling of the shell, not inside <main>: mat-sidenav-content
    // is its own stacking context, so a drawer inside it would sit under the toolbar.
    template: `
      ${appShell({ active: 'dashboard', content: dashboardMarkup() })}
      <tar-drawer title="Notifications" ariaLabel="Notifications" testId="notification-panel" [open]="panelOpen()" (closed)="panelOpen.set(false)">
        <tar-list ariaLabel="Unread notifications">
          <tar-list-item [interactive]="true" icon="person_add" title="Ama Mensah joined Toronto" description="Accepted Jordan Lee's invitation · 5 min ago" />
          <tar-list-item [interactive]="true" icon="view_kanban" title="You were assigned “Call Daily Bread about pallets”" description="Winter coat drive board · 1 hr ago" />
          <tar-list-item [interactive]="true" icon="event" title="Saturday breakfast club is full" description="40 of 40 RSVPs · Yesterday" />
        </tar-list>
        <div tar-drawer-footer>
          <tar-button variant="text" (clicked)="panelOpen.set(false)">Mark all as read</tar-button>
        </div>
      </tar-drawer>
    `,
  }),
  globals: { viewport: { value: 'desktop' } },
  parameters: {
    docs: {
      description: {
        story:
          'The bell opens a `tar-drawer` from the end edge (480px, full screen on phones) with `role="dialog"`. Its close button, the scrim and Escape all emit `closed`; footer actions go in `[tar-drawer-footer]`.',
      },
    },
  },
};
