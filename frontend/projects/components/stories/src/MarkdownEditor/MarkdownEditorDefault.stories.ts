import { signal } from '@angular/core';
import type { StoryObj } from '@storybook/angular';

import type { TarMarkdownEditor } from 'components';

export const Default: StoryObj<TarMarkdownEditor> = {
  args: {
    value:
      '## Community garden at Riverside Park\n\nTurn the **empty lot** behind the library into raised beds.\n- Ask the parks office for a permit\n- Recruit 10 volunteers from the Vancouver contacts',
    maxLength: 10000,
    uploadUrl: '/api/v1/uploads',
    maxUploadBytes: 10 * 1024 * 1024,
  },
  render: (args) => {
    const value = signal(args.value as unknown as string);
    return {
      props: { ...args, text: value, onChange: (v: string) => value.set(v) },
      template: `
        <div style="max-width: 640px">
          <tar-markdown-editor
            [value]="text()"
            [maxLength]="maxLength"
            [uploadUrl]="uploadUrl"
            [maxUploadBytes]="maxUploadBytes"
            (valueChange)="onChange($event)"
          />
        </div>
      `,
    };
  },
};
