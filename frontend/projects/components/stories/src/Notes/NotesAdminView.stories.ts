import type { StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import type { TarNotes } from 'components';

import { note, provideNotesApiStub } from './notes-api-stub';

export const AdminView: StoryObj<TarNotes> = {
  decorators: [
    moduleMetadata({
      providers: [
        provideNotesApiStub({
          me: { id: 'admin.ops', roles: ['SystemAdmin'] },
          notes: [
            note(
              'n1',
              'daniel.mensah',
              'Partner asked to move the food drive to the last week of June.',
              3,
            ),
            note('n2', 'lucia.herrera', 'Insurance certificate received and filed.', 72),
          ],
        }),
      ],
    }),
  ],
  render: () => ({
    template: `
      <div style="max-width: 560px">
        <tar-notes subjectType="Partner" subjectId="grace-community-kitchen" />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'A user with the `SystemAdmin` role can edit and delete anyone\'s notes. Edit swaps the note for an inline textarea with Save / Cancel; Delete removes it and shows a "Note deleted" snackbar.',
      },
    },
  },
};
