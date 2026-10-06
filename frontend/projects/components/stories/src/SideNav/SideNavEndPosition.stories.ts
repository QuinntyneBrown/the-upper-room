import type { StoryObj } from '@storybook/angular';

import type { TarSideNav } from 'components';

export const EndPosition: StoryObj<TarSideNav> = {
  render: () => ({
    template: `
      <div style="height: 360px">
        <tar-side-nav position="end">
          <nav tar-side-nav-content aria-label="Board" style="padding: 12px">
            <tar-list [role]="null">
              <tar-nav-item label="Activity" icon="history" />
              <tar-nav-item label="Members" icon="group" [badge]="8" />
              <tar-nav-item label="Settings" icon="settings" />
            </tar-list>
          </nav>
          <main style="padding: 24px">
            <h1 style="margin-top: 0">Summer camp planning</h1>
            <p>Board panels sit on the trailing edge.</p>
          </main>
        </tar-side-nav>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          '`position="end"` places the drawer on the trailing edge. Note the `.tar-side-nav__drawer` divider is a `border-right`, so on the end side it sits on the outer edge.',
      },
    },
  },
};
