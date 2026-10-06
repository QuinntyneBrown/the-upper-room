import type { StoryObj } from '@storybook/angular';

import type { TarList } from 'components';

export const Default: StoryObj<TarList> = {
  args: {
    ariaLabel: 'Recent contacts',
    role: 'list',
  },
  render: (args) => ({
    props: args,
    template: `
      <tar-list style="max-width: 420px" [ariaLabel]="ariaLabel" [role]="role">
        <tar-list-item title="Amara Okafor" description="Volunteer coordinator · Toronto" />
        <tar-list-item title="Daniel Reyes" description="Pastor, Grace Community Church" />
        <tar-list-item title="Hannah Lee" description="Event lead · Hamilton" />
      </tar-list>
    `,
  }),
};
