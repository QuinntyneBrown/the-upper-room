import type { StoryObj } from '@storybook/angular';

import type { TarEmptyState } from 'components';

export const Default: StoryObj<TarEmptyState> = {
  args: {
    heading: 'No contacts yet',
    body: 'Contacts you add in Toronto will appear here.',
    icon: 'contacts',
  },
  render: (args) => ({
    props: args,
    template: `<tar-empty-state [heading]="heading" [body]="body" [icon]="icon" />`,
  }),
};
