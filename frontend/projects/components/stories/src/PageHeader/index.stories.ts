import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { TarButton, TarIconButton, TarPageHeader } from 'components';

import descriptionMd from './PageHeaderDescription.md';
import bestPracticesMd from './PageHeaderBestPractices.md';

export { Default } from './PageHeaderDefault.stories';
export { WithActions } from './PageHeaderWithActions.stories';
export { WithBack } from './PageHeaderWithBack.stories';
export { Scrolled } from './PageHeaderScrolled.stories';

export default {
  title: 'Components/PageHeader',
  component: TarPageHeader,
  decorators: [moduleMetadata({ imports: [TarPageHeader, TarButton, TarIconButton] })],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<TarPageHeader>;
