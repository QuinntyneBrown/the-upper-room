import type { StoryObj } from '@storybook/angular';

import { appShell, shellProps } from '../shared/shell';
import { dashboardMarkup } from './dashboard';

export const Mobile: StoryObj = {
  render: () => ({
    props: shellProps(false),
    template: appShell({ active: 'dashboard', content: dashboardMarkup(), mobile: true }),
  }),
  globals: { viewport: { value: 'mobile' } },
  parameters: {
    docs: {
      description: {
        story:
          'On phones the drawer is modal (`mode="over"`) and starts closed. `tar-toolbar [showMenu]="true"` renders the menu button; its `menuClicked` output opens the drawer. Tap the scrim or press Escape to close it again.',
      },
    },
  },
};
