import { HttpClient } from '@angular/common/http';
import type { Provider } from '@angular/core';
import { of } from 'rxjs';

/**
 * Answers the editor's image upload (`POST uploadUrl`) without a backend, so
 * the toolbar's image button inserts a Markdown image link in the story.
 */
export const uploadStubProvider: Provider = {
  provide: HttpClient,
  useValue: {
    post: (_url: string, form: FormData) => {
      const file = form.get('file') as File | null;
      const name = encodeURIComponent(file?.name ?? 'image.png');
      return of({ url: `https://cdn.upperroom.org/uploads/${name}` });
    },
  },
};
