import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { TarButton } from 'components';

import descriptionMd from './ButtonDescription.md';
import bestPracticesMd from './ButtonBestPractices.md';

export { Default } from './ButtonDefault.stories';
export { Variant } from './ButtonVariant.stories';
export { WithIcon } from './ButtonWithIcon.stories';
export { States } from './ButtonStates.stories';
export { FullWidth } from './ButtonFullWidth.stories';

export default {
  title: 'Components/Button',
  component: TarButton,
  decorators: [moduleMetadata({ imports: [TarButton] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<TarButton>;
