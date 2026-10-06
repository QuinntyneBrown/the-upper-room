import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { TarMarkdownEditor } from 'components';

import descriptionMd from './MarkdownEditorDescription.md';
import bestPracticesMd from './MarkdownEditorBestPractices.md';
import { uploadStubProvider } from './upload-stub';

export { Default } from './MarkdownEditorDefault.stories';
export { Empty } from './MarkdownEditorEmpty.stories';
export { AtLimit } from './MarkdownEditorAtLimit.stories';
export { LivePreview } from './MarkdownEditorLivePreview.stories';

export default {
  title: 'Components/MarkdownEditor',
  component: TarMarkdownEditor,
  decorators: [moduleMetadata({ imports: [TarMarkdownEditor], providers: [uploadStubProvider] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<TarMarkdownEditor>;
