import type { StoryObj } from '@storybook/angular';

import type { TarAvatar } from 'components';

import { samplePhotoUrl } from './avatar-photo';

export const InList: StoryObj<TarAvatar> = {
  render: () => ({
    props: {
      contacts: [
        {
          displayName: 'Maya Okafor',
          email: 'maya.okafor@upperroom.org',
          role: 'City lead, Toronto',
        },
        {
          displayName: 'Daniel Mensah',
          email: 'daniel.mensah@upperroom.org',
          avatarUrl: samplePhotoUrl,
          role: 'Partner liaison, Accra',
        },
        {
          displayName: 'Lucía Herrera',
          email: 'lucia.herrera@upperroom.org',
          role: 'Events, Madrid',
        },
      ],
    },
    template: `
      <ul style="list-style: none; margin: 0; padding: 0; display: grid; gap: 12px; max-width: 360px">
        @for (c of contacts; track c.email) {
          <li style="display: flex; gap: 12px; align-items: center">
            <tar-avatar [user]="c" [size]="40" />
            <span style="display: grid">
              <span style="font: var(--md-sys-typescale-body-large)">{{ c.displayName }}</span>
              <span style="font: var(--md-sys-typescale-body-small); color: var(--md-sys-color-on-surface-variant)">{{ c.role }}</span>
            </span>
          </li>
        }
      </ul>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'A 40 px avatar leading a contact row. The image is decorative (`alt=""`), so the name beside it carries the meaning.',
      },
    },
  },
};
