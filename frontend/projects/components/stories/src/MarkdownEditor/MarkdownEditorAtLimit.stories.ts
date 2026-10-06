import { signal } from '@angular/core';
import type { StoryObj } from '@storybook/angular';

import type { TarMarkdownEditor } from 'components';

const summary = 'Monthly prayer breakfast for Madrid partners, hosted at a rotating venue.';

export const AtLimit: StoryObj<TarMarkdownEditor> = {
  render: () => {
    const value = signal(summary);
    return {
      props: { value, max: summary.length, onChange: (v: string) => value.set(v) },
      template: `
        <div style="max-width: 640px">
          <tar-markdown-editor [value]="value()" [maxLength]="max" (valueChange)="onChange($event)" />
        </div>
      `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          "`maxLength` sets the textarea's native `maxlength` and the counter. At the limit the counter turns to the error colour (`.md-char-count.error`) and no more characters can be typed.",
      },
    },
  },
};
