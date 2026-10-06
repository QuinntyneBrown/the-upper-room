import type { StoryObj } from '@storybook/angular';

import type { TarChipSet } from 'components';

export const ProjectedChips: StoryObj<TarChipSet> = {
  render: () => ({
    template: `
      <tar-chip-set ariaLabel="Idea tags">
        <tar-chip label="Community garden" icon="lightbulb" />
        <tar-chip label="Youth" />
        <tar-chip label="Needs funding" />
        <tar-chip label="Hamilton" icon="location_on" />
      </tar-chip-set>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'Without `single`, the set renders a `mat-chip-set` and projects its content — use it to group static `tar-chip`s with consistent wrapping and spacing.',
      },
    },
  },
};
