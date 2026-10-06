import { signal } from '@angular/core';
import type { StoryObj } from '@storybook/angular';

import type { TarAvatarUploader } from 'components';

export const FileSelected: StoryObj<TarAvatarUploader> = {
  render: () => {
    const selected = signal<string | null>(null);
    return {
      props: {
        user: { displayName: 'Maya Okafor', email: 'maya.okafor@upperroom.org' },
        selected,
        onFile: (file: File) => selected.set(`${file.name} (${Math.round(file.size / 1024)} KB)`),
      },
      template: `
        <div style="display: grid; gap: 12px; justify-items: start">
          <tar-avatar-uploader [user]="user" (fileSelected)="onFile($event)" />
          <span role="status" style="font: var(--md-sys-typescale-body-medium)">
            {{ selected() ? 'Ready to upload: ' + selected() : 'No file chosen yet.' }}
          </span>
        </div>
      `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          'Choose an image to see `fileSelected` fire with the `File`. The uploader only emits the file; the page uploads it and then passes the new `avatarUrl` back in. The input is cleared after each pick so the same file can be chosen again.',
      },
    },
  },
};
