import { provideHttpClient } from '@angular/common/http';
import { provideRouter, withHashLocation } from '@angular/router';
import { setCompodocJson } from '@storybook/addon-docs/angular';
import { applicationConfig, type Decorator, type Preview } from '@storybook/angular';

import { provideTarComponents } from 'components';

import docJson from '../documentation.json';

// Inputs, outputs and JSDoc for the autodocs ArgTypes tables come from
// compodoc (`compodoc: true` on the angular.json storybook targets).
setCompodocJson(docJson);

/**
 * Mirrors the app's `data-theme` switch (index.html applies it before first
 * paint; `_tokens.scss` re-points the `--md-sys-color-*` roles under
 * `[data-theme='dark']`), so every story and docs page can be checked in both
 * schemes from the toolbar.
 */
const withColorScheme: Decorator = (storyFn, context) => {
  const scheme = context.globals['theme'] === 'dark' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', scheme);
  return storyFn();
};

/**
 * Every story renders inside the same global chrome as the app: the
 * `angular.json` storybook targets load `projects/the-upper-room/src/styles.scss`
 * (Material 3 theme, `--md-sys-*` tokens, grid) and `preview-head.html` loads
 * the same web fonts as `index.html`. A router is provided because
 * `tar-nav-item` / `tar-side-nav` render `routerLink`s; hash location plus a
 * catch-all route keep those clicks inside the preview iframe instead of
 * rewriting `iframe.html`.
 */
const preview: Preview = {
  decorators: [
    withColorScheme,
    applicationConfig({
      providers: [
        provideRouter([{ path: '**', children: [] }], withHashLocation()),
        provideHttpClient(),
        provideTarComponents(),
      ],
    }),
  ],
  tags: ['autodocs'],
  globalTypes: {
    theme: {
      description: 'Colour scheme ([data-theme] on <html>)',
      toolbar: {
        title: 'Theme',
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'light',
  },
  parameters: {
    layout: 'padded',
    viewport: {
      // One width per tier of src/lib/breakpoints/_mixins.scss: xs (<576), md, xxl.
      options: {
        mobile: {
          name: 'Mobile (390×844)',
          styles: { width: '390px', height: '844px' },
          type: 'mobile',
        },
        tablet: {
          name: 'Tablet (820×1180)',
          styles: { width: '820px', height: '1180px' },
          type: 'tablet',
        },
        desktop: {
          name: 'Desktop (1440×900)',
          styles: { width: '1440px', height: '900px' },
          type: 'desktop',
        },
      },
    },
    controls: {
      expanded: true,
      matchers: { color: /(background|color)$/i },
    },
    a11y: {
      // Fail the a11y panel loudly; components are AA by design.
      test: 'error',
    },
    docs: {
      toc: { headingSelector: 'h2, h3' },
    },
    options: {
      storySort: {
        method: 'alphabetical',
        /**
         * @see https://storybook.js.org/docs/writing-stories/naming-components-and-hierarchy#sorting-stories
         */
        order: [
          'Concepts',
          [
            'Introduction',
            'Developer',
            ['Quick Start', 'Styling Components', 'Accessibility', 'Writing Stories'],
          ],
          'Theme',
          ['Overview', 'Colors', 'Typography', 'Spacing', 'Shape', 'Elevation', 'Motion', 'Layout'],
          'Components',
          'Patterns',
        ],
      },
    },
  },
};

export default preview;
