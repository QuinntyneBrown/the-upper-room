import { signal } from '@angular/core';
import type { StoryObj } from '@storybook/angular';

import type { TarSideNav } from 'components';

export const Overlay: StoryObj<TarSideNav> = {
  render: () => {
    const opened = signal(false);
    return {
      props: {
        opened,
        toggle: () => opened.update((o) => !o),
        sync: (o: boolean) => opened.set(o),
      },
      template: `
        <div style="height: 480px; display: flex; flex-direction: column">
          <tar-toolbar title="The Upper Room" [showMenu]="true" (menuClicked)="toggle()" />
          <div style="flex: 1; min-height: 0">
            <tar-side-nav mode="over" [opened]="opened()" (openedChange)="sync($event)">
              <nav tar-side-nav-content aria-label="Main" style="padding: 12px">
                <tar-list [role]="null">
                  <tar-nav-item label="Contacts" icon="contacts" routerLink="/contacts" />
                  <tar-nav-item label="Partners" icon="handshake" routerLink="/partners" />
                  <tar-nav-item label="Events" icon="event" routerLink="/events" [active]="true" />
                  <tar-nav-item label="Boards" icon="view_kanban" routerLink="/boards" />
                </tar-list>
              </nav>
              <main style="padding: 24px">
                <h1 style="margin-top: 0">Events</h1>
                <p>Open the menu in the toolbar; click the backdrop or press Escape to close.</p>
              </main>
            </tar-side-nav>
          </div>
        </div>
      `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          '`mode="over"` floats the drawer above the content with a backdrop — the phone layout. The host owns `opened`; closing via backdrop or Escape emits `openedChange(false)`, which the host must write back.',
      },
    },
  },
};
