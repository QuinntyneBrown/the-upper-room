import { signal } from '@angular/core';
import type { StoryObj } from '@storybook/angular';

import type { TarNavItem } from 'components';

export const Active: StoryObj<TarNavItem> = {
  render: () => {
    const current = signal('contacts');
    return {
      props: { current, go: (id: string) => current.set(id) },
      template: `
        <nav aria-label="Main" style="max-width: 280px">
          <tar-list [role]="null">
            <tar-nav-item label="Contacts" icon="contacts" routerLink="/contacts" [active]="current() === 'contacts'" (clicked)="go('contacts')" />
            <tar-nav-item label="Partners" icon="handshake" routerLink="/partners" [active]="current() === 'partners'" (clicked)="go('partners')" />
            <tar-nav-item label="Ideas" icon="lightbulb" routerLink="/ideas" [active]="current() === 'ideas'" (clicked)="go('ideas')" />
            <tar-nav-item label="Events" icon="event" routerLink="/events" [active]="current() === 'events'" (clicked)="go('events')" />
            <tar-nav-item label="Locations" icon="place" routerLink="/locations" [active]="current() === 'locations'" (clicked)="go('locations')" />
            <tar-nav-item label="Boards" icon="view_kanban" routerLink="/boards" [active]="current() === 'boards'" (clicked)="go('boards')" />
          </tar-list>
        </nav>
      `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          '`active` adds `.tar-nav-item--active` (secondary-container pill). The item does not track the router itself — the shell sets `active` from the current URL. Click items to move the highlight.',
      },
    },
  },
};
