import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { TarFab } from 'components';

import descriptionMd from './FabDescription.md';
import bestPracticesMd from './FabBestPractices.md';

export { Default } from './FabDefault.stories';
export { Extended } from './FabExtended.stories';
export { Disabled } from './FabDisabled.stories';

export default {
  title: 'Components/Fab',
  component: TarFab,
  decorators: [moduleMetadata({ imports: [TarFab] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<TarFab>;
