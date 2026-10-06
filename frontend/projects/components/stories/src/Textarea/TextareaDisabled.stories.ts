import type { StoryObj } from '@storybook/angular';

import type { TarTextarea } from 'components';

export const Disabled: StoryObj<TarTextarea> = {
  render: () => ({
    template: `
      <div style="max-width: 480px">
        <tar-textarea label="Location access notes" value="Ramp entrance on Elm Street. Lift to the second floor." [disabled]="true" />
      </div>
    `,
  }),
  parameters: { docs: { description: { story: '`disabled` disables the native `<textarea>`.' } } },
};
