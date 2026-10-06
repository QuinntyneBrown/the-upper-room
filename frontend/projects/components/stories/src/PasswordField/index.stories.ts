import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { TarPasswordField } from 'components';

import descriptionMd from './PasswordFieldDescription.md';
import bestPracticesMd from './PasswordFieldBestPractices.md';

export { Default } from './PasswordFieldDefault.stories';
export { NewPassword } from './PasswordFieldNewPassword.stories';
export { WithError } from './PasswordFieldWithError.stories';
export { Disabled } from './PasswordFieldDisabled.stories';
export { BoundToSignal } from './PasswordFieldBoundToSignal.stories';

export default {
  title: 'Components/PasswordField',
  component: TarPasswordField,
  decorators: [moduleMetadata({ imports: [TarPasswordField] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<TarPasswordField>;
