import type { StoryObj } from '@storybook/angular';

import type { TarCard } from 'components';

export const Default: StoryObj<TarCard> = {
  args: {
    heading: 'Grace Community Church',
    subheading: 'Partner · Toronto',
    appearance: 'filled',
    interactive: false,
    showActions: false,
    testId: 'partner-card',
  },
  render: (args) => ({
    props: args,
    template: `
      <tar-card style="max-width: 400px" [heading]="heading" [subheading]="subheading" [appearance]="appearance" [interactive]="interactive" [showActions]="showActions" [testId]="testId">
        <p>Hosts the monthly prayer breakfast and lends its hall for city-wide events.</p>
        <div tar-card-actions>
          <tar-button variant="text">View partner</tar-button>
        </div>
      </tar-card>
    `,
  }),
};
