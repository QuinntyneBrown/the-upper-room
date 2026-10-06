import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { TarList, TarNavItem, TarSideNav, TarToolbar } from 'components';

import descriptionMd from './SideNavDescription.md';
import bestPracticesMd from './SideNavBestPractices.md';

export { Default } from './SideNavDefault.stories';
export { Overlay } from './SideNavOverlay.stories';
export { EndPosition } from './SideNavEndPosition.stories';

export default {
  title: 'Components/SideNav',
  component: TarSideNav,
  decorators: [moduleMetadata({ imports: [TarSideNav, TarNavItem, TarList, TarToolbar] })],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<TarSideNav>;
