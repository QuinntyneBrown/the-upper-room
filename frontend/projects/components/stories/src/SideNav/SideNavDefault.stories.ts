import type { StoryObj } from '@storybook/angular';

import type { TarSideNav } from 'components';

export const Default: StoryObj<TarSideNav> = {
  args: {
    mode: 'side',
    opened: true,
    position: 'start',
    fixedInViewport: false,
    testId: 'side-nav',
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="height: 480px">
        <tar-side-nav [mode]="mode" [opened]="opened" [position]="position" [fixedInViewport]="fixedInViewport" [testId]="testId">
          <nav tar-side-nav-content aria-label="Main" style="padding: 12px">
            <tar-list [role]="null">
              <tar-nav-item label="Contacts" icon="contacts" routerLink="/contacts" [active]="true" />
              <tar-nav-item label="Partners" icon="handshake" routerLink="/partners" />
              <tar-nav-item label="Ideas" icon="lightbulb" routerLink="/ideas" [badge]="3" />
              <tar-nav-item label="Events" icon="event" routerLink="/events" />
              <tar-nav-item label="Locations" icon="place" routerLink="/locations" />
              <tar-nav-item label="Boards" icon="view_kanban" routerLink="/boards" />
            </tar-list>
          </nav>
          <main style="padding: 24px">
            <h1 style="margin-top: 0">Contacts</h1>
            <p>212 people across 48 partners in Toronto.</p>
          </main>
        </tar-side-nav>
      </div>
    `,
  }),
};
