import type { StoryObj } from '@storybook/angular';

import type { TarFormActions } from 'components';

export const Default: StoryObj<TarFormActions> = {
  args: {
    saveLabel: 'Save contact',
    cancelLabel: 'Cancel',
    saveType: 'button',
    dirty: true,
    saving: false,
    disabled: false,
    sticky: false,
    align: 'end',
    saveTestId: 'contact-save',
    cancelTestId: 'contact-cancel',
  },
  render: (args) => ({
    props: args,
    template: `<tar-form-actions [saveLabel]="saveLabel" [cancelLabel]="cancelLabel" [saveType]="saveType" [dirty]="dirty" [saving]="saving" [disabled]="disabled" [sticky]="sticky" [align]="align" [saveTestId]="saveTestId" [cancelTestId]="cancelTestId" />`,
  }),
};
