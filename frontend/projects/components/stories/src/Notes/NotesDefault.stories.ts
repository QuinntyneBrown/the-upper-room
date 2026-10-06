import type { StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import type { TarNotes } from 'components';

import { note, provideNotesApiStub } from './notes-api-stub';

export const Default: StoryObj<TarNotes> = {
  args: {
    subjectType: 'Partner',
    subjectId: 'grace-community-kitchen',
  },
  decorators: [
    moduleMetadata({
      providers: [
        provideNotesApiStub({
          me: { id: 'maya.okafor', roles: ['CityLead'] },
          notes: [
            note(
              'n1',
              'maya.okafor',
              'Confirmed **Saturday 9am** for the volunteer orientation.',
              2,
            ),
            note(
              'n2',
              'daniel.mensah',
              'Kitchen can host up to 40 people; parking is on Elm St.',
              30,
            ),
          ],
        }),
      ],
    }),
  ],
  render: (args) => ({
    props: args,
    template: `
      <div style="max-width: 560px">
        <tar-notes [subjectType]="subjectType" [subjectId]="subjectId" />
      </div>
    `,
  }),
};
