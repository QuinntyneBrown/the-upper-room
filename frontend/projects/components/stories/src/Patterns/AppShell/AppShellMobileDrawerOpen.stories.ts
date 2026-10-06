import type { StoryObj } from '@storybook/angular';

import { appShell, shellProps } from '../shared/shell';
import { dashboardMarkup } from './dashboard';

export const MobileDrawerOpen: StoryObj = {
  name: 'Mobile, drawer open',
  render: () => ({
    props: shellProps(true),
    template: appShell({ active: 'contacts', content: dashboardMarkup(), mobile: true }),
  }),
  globals: { viewport: { value: 'mobile' } },
  parameters: {
    docs: {
      description: {
        story:
          "The modal drawer slides in from the start edge over a scrim. It holds the signed-in member's name and city, then the Workspace, People and Activities sections. Choosing an item navigates and closes the drawer.",
      },
    },
  },
};
