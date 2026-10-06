import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { TarButton, TarDrawer } from 'components';

import descriptionMd from './DrawerDescription.md';
import bestPracticesMd from './DrawerBestPractices.md';

export { Default } from './DrawerDefault.stories';
export { WithTrigger } from './DrawerWithTrigger.stories';
export { StartPosition } from './DrawerStartPosition.stories';
export { Complementary } from './DrawerComplementary.stories';

export default {
  title: 'Components/Drawer',
  component: TarDrawer,
  decorators: [moduleMetadata({ imports: [TarDrawer, TarButton] })],
  parameters: {
    layout: 'fullscreen',
    docs: {
      // The drawer is position: fixed; render each story in its own iframe so it
      // stays inside its preview instead of covering the docs page.
      story: { inline: false, iframeHeight: 520 },
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<TarDrawer>;
