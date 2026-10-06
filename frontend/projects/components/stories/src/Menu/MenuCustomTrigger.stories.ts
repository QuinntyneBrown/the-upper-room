import type { StoryObj } from '@storybook/angular';

import type { TarMenu, TarMenuItem } from 'components';

export const CustomTrigger: StoryObj<TarMenu> = {
  render: () => {
    const sortItems: TarMenuItem[] = [
      { id: 'name', label: 'Name (A–Z)' },
      { id: 'recent', label: 'Recently updated' },
      { id: 'city', label: 'City' },
    ];
    const filterItems: TarMenuItem[] = [
      { id: 'all', label: 'All partners' },
      { id: 'active', label: 'Active only' },
      { id: 'lapsed', label: 'Lapsed only' },
    ];
    return {
      props: { sortItems, filterItems },
      template: `
        <div style="display: flex; gap: 8px">
          <tar-menu [items]="sortItems" triggerIcon="swap_vert" ariaLabel="Sort partners" />
          <tar-menu [items]="filterItems" triggerIcon="filter_list" ariaLabel="Filter partners" />
        </div>
      `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          '`triggerIcon` swaps the `more_vert` glyph on the `mat-icon-button` trigger; give each trigger its own `ariaLabel`. Items without `icon` render text only.',
      },
    },
  },
};
