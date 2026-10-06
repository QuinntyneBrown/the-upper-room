import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { TarIcon } from 'components';

import descriptionMd from './IconDescription.md';
import bestPracticesMd from './IconBestPractices.md';

export { Default } from './IconDefault.stories';
export { Sizes } from './IconSizes.stories';
export { AliasGallery } from './IconAliasGallery.stories';
export { RawLigature } from './IconRawLigature.stories';

export default {
  title: 'Components/Icon',
  component: TarIcon,
  decorators: [moduleMetadata({ imports: [TarIcon] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<TarIcon>;
