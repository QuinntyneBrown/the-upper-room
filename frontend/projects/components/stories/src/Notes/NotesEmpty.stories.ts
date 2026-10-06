import type { StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import type { TarNotes } from 'components';

import { provideNotesApiStub } from './notes-api-stub';

export const Empty: StoryObj<TarNotes> = {
  decorators: [
    moduleMetadata({
      providers: [provideNotesApiStub({ me: { id: 'priya.nair', roles: [] }, notes: [] })],
    }),
  ],
  render: () => ({
    template: `
      <div style="max-width: 560px">
        <tar-notes subjectType="Event" subjectId="madrid-prayer-breakfast" />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'With no notes the list shows "No notes yet." under the composer. Try saving a one-character note to see the inline validation error, or a real one to see it added to the top of the list.',
      },
    },
  },
};
