import type { StoryObj } from '@storybook/angular';

import type { TarRelativeTime } from 'components';

const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();

export const InActivityFeed: StoryObj<TarRelativeTime> = {
  render: () => ({
    props: {
      items: [
        {
          id: 1,
          text: 'Maya Okafor moved "Venue walkthrough" to Done on the Toronto launch board',
          at: minutesAgo(4),
        },
        {
          id: 2,
          text: 'Daniel Mensah added Grace Community Kitchen as a partner in Accra',
          at: minutesAgo(95),
        },
        {
          id: 3,
          text: 'Lucía Herrera created the event "Madrid prayer breakfast"',
          at: minutesAgo(2 * 24 * 60),
        },
      ],
    },
    template: `
      <ul style="list-style: none; margin: 0; padding: 0; display: grid; gap: 12px; max-width: 480px">
        @for (item of items; track item.id) {
          <li style="display: grid; gap: 2px">
            <span style="font: var(--md-sys-typescale-body-medium)">{{ item.text }}</span>
            <tar-relative-time
              [timestamp]="item.at"
              style="font: var(--md-sys-typescale-label-small); color: var(--md-sys-color-on-surface-variant)"
            />
          </li>
        }
      </ul>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'The component renders bare text, so the host styles it. Each instance re-renders once a minute, keeping feeds fresh without a reload.',
      },
    },
  },
};
