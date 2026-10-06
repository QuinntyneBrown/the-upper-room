import type { StoryObj } from '@storybook/angular';

import type { TarButton } from 'components';

export const Default: StoryObj<TarButton> = {
  args: {
    variant: 'filled',
    color: 'primary',
    icon: null,
    disabled: false,
    loading: false,
    fullWidth: false,
  },
  render: (args) => ({
    props: args,
    template: `<tar-button [variant]="variant" [color]="color" [icon]="icon" [disabled]="disabled" [loading]="loading" [fullWidth]="fullWidth">Save contact</tar-button>`,
  }),
};
