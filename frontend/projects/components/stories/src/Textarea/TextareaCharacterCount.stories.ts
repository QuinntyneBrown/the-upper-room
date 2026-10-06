import { signal } from '@angular/core';
import type { StoryObj } from '@storybook/angular';

import type { TarTextarea } from 'components';

export const CharacterCount: StoryObj<TarTextarea> = {
  render: () => {
    const summary = signal(
      'A shared tool library at the Northside hub so partners can borrow event gear.',
    );
    return {
      props: { summary },
      template: `
      <div style="max-width: 480px">
        <tar-textarea label="Idea summary" [rows]="3" [maxLength]="280" [value]="summary()" (valueChange)="summary.set($event)" [hint]="summary().length + ' / 280'" />
      </div>
    `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          'Controlled usage with a signal: `maxLength` caps the input and `hint` shows the running count.',
      },
    },
  },
};
