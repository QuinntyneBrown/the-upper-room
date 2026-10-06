import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { TarIconButton } from 'components';

import descriptionMd from './IconButtonDescription.md';
import bestPracticesMd from './IconButtonBestPractices.md';

export { Default } from './IconButtonDefault.stories';
export { RowActions } from './IconButtonRowActions.stories';
export { Disabled } from './IconButtonDisabled.stories';

export default {
  title: 'Components/IconButton',
  component: TarIconButton,
  decorators: [moduleMetadata({ imports: [TarIconButton] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<TarIconButton>;
