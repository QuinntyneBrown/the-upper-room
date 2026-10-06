import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { TarTextField } from 'components';

import descriptionMd from './TextFieldDescription.md';
import bestPracticesMd from './TextFieldBestPractices.md';

export { Default } from './TextFieldDefault.stories';
export { HintAndError } from './TextFieldHintAndError.stories';
export { WithIcons } from './TextFieldWithIcons.stories';
export { States } from './TextFieldStates.stories';
export { Appearance } from './TextFieldAppearance.stories';
export { BoundToSignal } from './TextFieldBoundToSignal.stories';

export default {
  title: 'Components/TextField',
  component: TarTextField,
  decorators: [moduleMetadata({ imports: [TarTextField] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<TarTextField>;
