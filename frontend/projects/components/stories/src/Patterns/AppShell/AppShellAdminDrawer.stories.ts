import type { StoryObj } from '@storybook/angular';

import { GUTTER, appShell, shellProps } from '../shared/shell';

export const AdminDrawer: StoryObj = {
  name: 'Admin drawer',
  render: () => ({
    props: shellProps(true),
    template: appShell({
      active: 'tags',
      admin: true,
      content: `
        <tar-page-header title="Tags" eyebrow="Admin" subtitle="Shared labels for contacts, partners and Kanban cards.">
          <tar-button icon="add">New tag</tar-button>
        </tar-page-header>
        <div style="${GUTTER}">
          <tar-list ariaLabel="Tags">
            <tar-list-item [interactive]="true" icon="sell" title="Food security" description="Used on 42 contacts and 9 cards" />
            <tar-list-item [interactive]="true" icon="sell" title="Youth mentoring" description="Used on 18 contacts and 4 cards" />
            <tar-list-item [interactive]="true" icon="sell" title="Newcomer support" description="Used on 31 contacts and 6 cards" />
          </tar-list>
        </div>
      `,
    }),
  }),
  globals: { viewport: { value: 'desktop' } },
  parameters: {
    docs: {
      description: {
        story:
          'SystemAdmins get a fourth section, Admin (Users, Roles, Tags, Audit Log, Settings). Members never see it: the section is not rendered at all rather than disabled.',
      },
    },
  },
};
