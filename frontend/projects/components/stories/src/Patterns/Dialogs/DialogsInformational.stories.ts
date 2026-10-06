import type { StoryObj } from '@storybook/angular';

import type { ConfirmOptions } from 'components';

const confirm: ConfirmOptions = {
  title: 'Send 3 invitations?',
  body: 'Priya Raman, Marcus Oyelaran and Sofia Alvarez will get an email inviting them to join Toronto. Invitations expire after 7 days.',
  severity: 'info',
  confirmLabel: 'Send invitations',
};

export const Informational: StoryObj = {
  render: () => ({
    props: { confirm },
    template: `
      <story-dialog-stage
        eyebrow="Admin"
        pageTitle="Users"
        subtitle="3 people selected"
        triggerLabel="Invite"
        triggerIcon="send"
        triggerVariant="filled"
        [confirm]="confirm"
      />
    `,
  }),
  globals: { viewport: { value: 'desktop' } },
  parameters: {
    docs: {
      description: {
        story:
          'The default `info` severity keeps the standard surface. Use it to confirm actions with outside effects (emails sent, people notified) rather than for every save.',
      },
    },
  },
};
