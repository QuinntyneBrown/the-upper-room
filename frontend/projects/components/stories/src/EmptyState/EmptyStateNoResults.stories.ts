import type { StoryObj } from '@storybook/angular';

import type { TarEmptyState } from 'components';

export const NoResults: StoryObj<TarEmptyState> = {
  render: () => ({
    template: `
      <tar-empty-state
        heading="No events match"
        body="Nothing on the calendar for “food drive” in Montréal. Try a different search or clear the filters."
        icon="search"
      >
        <tar-button variant="text">Clear filters</tar-button>
      </tar-empty-state>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'The same component when a search or filter returns nothing. Say what was searched for and offer a way back.',
      },
    },
  },
};
