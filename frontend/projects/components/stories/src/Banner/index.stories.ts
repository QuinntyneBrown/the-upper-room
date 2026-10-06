import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { TarBanner, TarButton } from 'components';

import descriptionMd from './BannerDescription.md';
import bestPracticesMd from './BannerBestPractices.md';

export { Default } from './BannerDefault.stories';
export { Severity } from './BannerSeverity.stories';
export { WithAction } from './BannerWithAction.stories';
export { Dismissible } from './BannerDismissible.stories';

export default {
  title: 'Components/Banner',
  component: TarBanner,
  decorators: [moduleMetadata({ imports: [TarBanner, TarButton] })],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<TarBanner>;
