import type { StoryObj } from '@storybook/angular';

import type { TarList } from 'components';

export const WithIcons: StoryObj<TarList> = {
  render: () => ({
    template: `
      <tar-list style="max-width: 420px" ariaLabel="Upcoming events">
        <tar-list-item icon="event" title="Prayer breakfast" description="Sat, Oct 10 · Grace Community Church" />
        <tar-divider [inset]="true" />
        <tar-list-item icon="event" title="City-wide worship night" description="Fri, Oct 16 · Harbourfront Park" />
        <tar-divider [inset]="true" />
        <tar-list-item icon="place" title="New location: Riverside Hall" description="Added by Hannah Lee" />
      </tar-list>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          '`icon` renders a leading `mat-icon` (`.tar-list-item__icon`, `matListItemIcon`); `description` renders a second line (`.tar-list-item__description`). Inset `tar-divider`s separate items.',
      },
    },
  },
};
