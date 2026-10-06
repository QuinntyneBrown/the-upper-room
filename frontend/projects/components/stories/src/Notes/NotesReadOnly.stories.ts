import type { StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import type { TarNotes } from 'components';

import { note, provideNotesApiStub } from './notes-api-stub';

export const ReadOnly: StoryObj<TarNotes> = {
  decorators: [
    moduleMetadata({
      providers: [
        provideNotesApiStub({
          me: { id: 'priya.nair', roles: ['Member'] },
          notes: [
            note(
              'n1',
              'maya.okafor',
              'Raised this with the Vancouver parks office; waiting on a permit date.',
              5,
            ),
            note('n2', 'lucia.herrera', 'Shared the sign-up link with the Madrid team.', 50),
          ],
        }),
      ],
    }),
  ],
  render: () => ({
    template: `
      <div style="max-width: 560px">
        <tar-notes subjectType="Idea" subjectId="riverside-community-garden" />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'Edit and Delete appear only on notes the signed-in user wrote (or for a `SystemAdmin`). Here every note belongs to someone else, so only the composer is actionable.',
      },
    },
  },
};
