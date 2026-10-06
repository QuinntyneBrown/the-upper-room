import type { StoryObj } from '@storybook/angular';

import type { TarDrawer } from 'components';

export const Complementary: StoryObj<TarDrawer> = {
  render: () => ({
    template: `
      <tar-drawer [open]="true" role="complementary" [closeOnScrim]="false" title="Board activity" ariaLabel="Board activity">
        <p style="margin-top: 0"><strong>Amara Okafor</strong> moved “Book venue” to Done.</p>
        <p><strong>Daniel Reyes</strong> added “Order T-shirts” to To do.</p>
        <p><strong>Hannah Lee</strong> commented on “Volunteer rota”.</p>
      </tar-drawer>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          '`role="complementary"` drops `aria-modal` for supporting panels. `closeOnScrim` false keeps the panel open when the scrim is clicked; the close button and Escape still emit `closed`.',
      },
    },
  },
};
