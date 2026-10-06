import type { StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import type { TarNotes } from 'components';

import { historyEntry, note, provideNotesApiStub } from './notes-api-stub';

export const WithHistory: StoryObj<TarNotes> = {
  decorators: [
    moduleMetadata({
      providers: [
        provideNotesApiStub({
          me: { id: 'maya.okafor', roles: ['CityLead'] },
          notes: [
            note('n1', 'maya.okafor', 'Venue confirmed: **St. Lawrence Hall**, capacity 120.', 1, [
              historyEntry(
                'h2',
                'maya.okafor',
                'Venue shortlist: St. Lawrence Hall or Artscape.',
                26,
              ),
              historyEntry('h1', 'maya.okafor', 'Still looking for a venue downtown.', 74),
            ]),
          ],
        }),
      ],
    }),
  ],
  render: () => ({
    template: `
      <div style="max-width: 560px">
        <tar-notes subjectType="Event" subjectId="toronto-spring-gathering" />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'A note that has been edited shows a History action. It opens the internal edit-history dialog (a `MatDialog`): versions on the left, a preview of the selected version on the right.',
      },
    },
  },
};
