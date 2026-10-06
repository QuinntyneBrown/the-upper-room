import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { TarTabs } from 'components';

import descriptionMd from './TabsDescription.md';
import bestPracticesMd from './TabsBestPractices.md';

export { Default } from './TabsDefault.stories';
export { Controlled } from './TabsControlled.stories';
export { DisabledTab } from './TabsDisabledTab.stories';

export default {
  title: 'Components/Tabs',
  component: TarTabs,
  decorators: [moduleMetadata({ imports: [TarTabs] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<TarTabs>;
