import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { TarList, TarNavItem } from 'components';

import descriptionMd from './NavItemDescription.md';
import bestPracticesMd from './NavItemBestPractices.md';

export { Default } from './NavItemDefault.stories';
export { Active } from './NavItemActive.stories';
export { WithBadge } from './NavItemWithBadge.stories';
export { AsButton } from './NavItemAsButton.stories';

export default {
  title: 'Components/NavItem',
  component: TarNavItem,
  decorators: [moduleMetadata({ imports: [TarNavItem, TarList] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<TarNavItem>;
