import type { StoryObj } from '@storybook/angular';

import type { TarTextarea } from 'components';

export const Rows: StoryObj<TarTextarea> = {
  render: () => ({
    template: `
      <div style="max-width: 480px; display: grid; gap: 16px">
        <tar-textarea label="Card description" [rows]="2" placeholder="What needs to happen for this card to move to Done?" />
        <tar-textarea label="Event details" [rows]="6" placeholder="Agenda, parking, accessibility notes…" />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: '`rows` sets the initial height (default 4); the field can be resized vertically.',
      },
    },
  },
};
