import type { StoryObj } from '@storybook/angular';

import type { TarSkeleton } from 'components';

export const Compact: StoryObj<TarSkeleton> = {
  render: () => ({
    template: `
      <div style="max-width: 320px">
        <tar-skeleton [rowCount]="3" [rowHeight]="24" />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: "Shorter rows for dense content, such as the tag list in a contact's side panel.",
      },
    },
  },
};
