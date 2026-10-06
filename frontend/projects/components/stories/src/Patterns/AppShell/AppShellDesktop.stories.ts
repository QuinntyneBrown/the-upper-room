import type { StoryObj } from '@storybook/angular';

import { appShell, shellProps } from '../shared/shell';
import { dashboardMarkup } from './dashboard';

export const Desktop: StoryObj = {
  render: () => ({
    props: shellProps(true),
    template: appShell({ active: 'dashboard', content: dashboardMarkup() }),
  }),
  globals: { viewport: { value: 'desktop' } },
  parameters: {
    docs: {
      description: {
        story:
          'From the LG breakpoint the drawer is persistent (`tar-side-nav mode="side"`) and the toolbar drops its menu button. The active route\'s `tar-nav-item` carries `.tar-nav-item--active` (secondary-container fill); every other item stays neutral.',
      },
    },
  },
};
