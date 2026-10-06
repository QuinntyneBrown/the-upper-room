import type { StoryObj } from '@storybook/angular';

import type { TarEmptyState } from 'components';

export const Gallery: StoryObj<TarEmptyState> = {
  render: () => ({
    template: `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px">
        <tar-empty-state heading="No ideas yet" body="Capture the first idea for Hamilton." icon="ideas" />
        <tar-empty-state heading="No upcoming events" body="Events you schedule will show here." icon="events" />
        <tar-empty-state heading="No locations" body="Add the venues and spaces you use." icon="locations" />
        <tar-empty-state heading="This column is empty" body="Drag a card here or add a new one." icon="kanban" />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "`icon` is passed to `tar-icon`, so it accepts the library's aliases (`contacts`, `partners`, `ideas`, `events`, `locations`, `kanban`, …) as well as raw Material Symbols names. The default is `info`.",
      },
    },
  },
};
