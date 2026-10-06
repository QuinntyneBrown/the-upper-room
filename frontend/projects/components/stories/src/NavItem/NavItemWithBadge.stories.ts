import type { StoryObj } from '@storybook/angular';

import type { TarNavItem } from 'components';

export const WithBadge: StoryObj<TarNavItem> = {
  render: () => ({
    template: `
      <nav aria-label="Main" style="max-width: 280px">
        <tar-list [role]="null">
          <tar-nav-item label="Ideas" icon="lightbulb" routerLink="/ideas" [badge]="3" />
          <tar-nav-item label="Events" icon="event" routerLink="/events" badge="New" />
          <tar-nav-item label="Boards" icon="view_kanban" routerLink="/boards" [badge]="0" />
        </tar-list>
      </nav>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          '`badge` (string or number) renders a trailing `.tar-nav-item__badge` pill in the `matListItemMeta` slot. Any value other than `null` shows — including `0`, so pass `null` to hide it.',
      },
    },
  },
};
