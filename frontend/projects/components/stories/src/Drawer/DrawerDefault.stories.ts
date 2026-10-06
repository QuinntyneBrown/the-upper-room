import type { StoryObj } from '@storybook/angular';

import type { TarDrawer } from 'components';

export const Default: StoryObj<TarDrawer> = {
  args: {
    open: true,
    title: 'Hannah Lee',
    position: 'end',
    role: 'dialog',
    ariaLabel: 'Contact details',
    closeOnScrim: true,
    testId: 'contact-drawer',
  },
  render: (args) => ({
    props: args,
    template: `
      <tar-drawer [open]="open" [title]="title" [position]="position" [role]="role" [ariaLabel]="ariaLabel" [closeOnScrim]="closeOnScrim" [testId]="testId">
        <p style="margin-top: 0"><strong>Event lead</strong> · Hamilton</p>
        <p>hannah.lee@example.org<br />(905) 555-0142</p>
        <p>Coordinates volunteers for the monthly prayer breakfast.</p>
        <div tar-drawer-footer>
          <tar-button variant="text">Close</tar-button>
          <tar-button icon="edit">Edit contact</tar-button>
        </div>
      </tar-drawer>
    `,
  }),
};
