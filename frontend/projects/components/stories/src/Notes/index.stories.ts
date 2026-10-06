import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { TarNotes } from 'components';

import descriptionMd from './NotesDescription.md';
import bestPracticesMd from './NotesBestPractices.md';

export { Default } from './NotesDefault.stories';
export { Empty } from './NotesEmpty.stories';
export { ReadOnly } from './NotesReadOnly.stories';
export { AdminView } from './NotesAdminView.stories';
export { WithHistory } from './NotesWithHistory.stories';

export default {
  title: 'Components/Notes',
  component: TarNotes,
  decorators: [moduleMetadata({ imports: [TarNotes] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<TarNotes>;
