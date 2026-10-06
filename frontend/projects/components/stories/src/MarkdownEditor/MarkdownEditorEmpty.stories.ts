import { signal } from '@angular/core';
import type { StoryObj } from '@storybook/angular';

import type { TarMarkdownEditor } from 'components';

export const Empty: StoryObj<TarMarkdownEditor> = {
  render: () => {
    const value = signal('');
    return {
      props: { value, onChange: (v: string) => value.set(v) },
      template: `
        <div style="max-width: 640px">
          <tar-markdown-editor [value]="value()" (valueChange)="onChange($event)" />
        </div>
      `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          'A new idea: the textarea shows the "Write your idea here…" placeholder and the counter starts at `0 / 10000`.',
      },
    },
  },
};
