import type { StoryObj } from '@storybook/angular';

import type { TarShareButton } from 'components';

export const Default: StoryObj<TarShareButton> = {
  render: () => ({
    template: `<tar-share-button />`,
  }),
};
