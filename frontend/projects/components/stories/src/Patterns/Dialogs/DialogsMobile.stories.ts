import type { StoryObj } from '@storybook/angular';

import type { ConfirmOptions } from 'components';

const confirm: ConfirmOptions = {
  title: 'Archive “Call Daily Bread about pallets”?',
  body: 'The card leaves the board. Turn on Show archived to find it again.',
  severity: 'warning',
  confirmLabel: 'Archive',
};

export const Mobile: StoryObj = {
  render: () => ({
    props: { confirm },
    template: `
      <story-dialog-stage
        eyebrow="Winter coat drive"
        pageTitle="Call Daily Bread about pallets"
        triggerLabel="Archive"
        triggerIcon="inventory_2"
        [confirm]="confirm"
      />
    `,
  }),
  globals: { viewport: { value: 'mobile' } },
  parameters: {
    docs: {
      description: {
        story:
          'At 390px the confirm dialog keeps its 280px minimum and centres with the standard Material side margins. Titles should still fit in two lines.',
      },
    },
  },
};
