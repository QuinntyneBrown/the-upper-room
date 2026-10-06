/**
 * Small React blocks for the Theme MDX pages (docs pages render with React
 * even in an Angular Storybook). Written with `createElement` so they need
 * no JSX transform. Every preview paints with the live `var(--token)`, so
 * what you see is the live stylesheet, not a copy of it.
 */
import { createElement as h } from 'react';

import { byPrefix } from './tokens';

const code = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  fontSize: 13,
};
const muted = { color: 'var(--md-sys-color-on-surface-variant)', fontSize: 13 };
const row = {
  display: 'grid',
  gridTemplateColumns: 'minmax(180px, 300px) 1fr',
  gap: 16,
  alignItems: 'center',
  padding: '12px 0',
  borderBottom: '1px solid var(--md-sys-color-outline-variant)',
};

function Meta({ token }) {
  return h(
    'div',
    null,
    h('code', { style: { ...code, fontWeight: 600 } }, `var(--${token.name})`),
    h('div', { style: { ...muted, ...code } }, token.value),
  );
}

/**
 * Colour swatches in a responsive grid. Pass `prefixes`; `exclude` drops
 * names containing any of the given fragments.
 */
export function ColorGrid({ prefixes, exclude = [] }) {
  const tokens = byPrefix(...prefixes).filter((t) => !exclude.some((x) => t.name.includes(x)));
  return h(
    'div',
    {
      className: 'sb-unstyled',
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 16,
        margin: '16px 0 32px',
      },
    },
    tokens.map((t) =>
      h(
        'div',
        {
          key: t.name,
          style: {
            border: '1px solid var(--md-sys-color-outline-variant)',
            borderRadius: 'var(--md-sys-shape-corner-medium)',
            overflow: 'hidden',
            background: 'var(--md-sys-color-surface)',
          },
        },
        h('div', {
          style: {
            height: 72,
            background: `var(--${t.name})`,
            borderBottom: '1px solid var(--md-sys-color-outline-variant)',
          },
        }),
        h('div', { style: { padding: 12 } }, h(Meta, { token: t })),
      ),
    ),
  );
}

/** One row per token with a live preview rendered by `preview(token)`. */
export function TokenRows({ prefixes, preview }) {
  return h(
    'div',
    { className: 'sb-unstyled', style: { margin: '16px 0 32px' } },
    byPrefix(...prefixes).map((t) =>
      h('div', { key: t.name, style: row }, h(Meta, { token: t }), h('div', null, preview(t))),
    ),
  );
}

export const previews = {
  typescale: (t) => h('span', { style: { font: `var(--${t.name})` } }, 'Partners in Toronto'),
  space: (t) =>
    h('div', {
      style: {
        width: `max(2px, var(--${t.name}))`,
        height: 16,
        background: 'var(--md-sys-color-primary)',
        borderRadius: 4,
      },
    }),
  shape: (t) =>
    h('div', {
      style: {
        width: 96,
        height: 56,
        borderRadius: `var(--${t.name})`,
        background: 'var(--md-sys-color-primary-container)',
        border: '1px solid var(--md-sys-color-primary)',
      },
    }),
  elevation: (t) =>
    h('div', {
      style: {
        width: 140,
        height: 72,
        borderRadius: 'var(--md-sys-shape-corner-medium)',
        background: 'var(--md-sys-color-surface-container-low)',
        boxShadow: `var(--${t.name})`,
      },
    }),
  duration: (t) =>
    h(
      'div',
      { className: 'tar-motion-demo', style: { '--_dur': `var(--${t.name})` } },
      h('div', { className: 'tar-motion-demo__dot' }),
    ),
  easing: (t) =>
    h(
      'div',
      {
        className: 'tar-motion-demo',
        style: { '--_dur': 'var(--md-sys-motion-duration-long2)', '--_ease': `var(--${t.name})` },
      },
      h('div', { className: 'tar-motion-demo__dot' }),
    ),
  iconSize: (t) =>
    h(
      'span',
      {
        className: 'material-icons',
        'aria-hidden': 'true',
        style: { fontSize: `var(--${t.name})`, color: 'var(--md-sys-color-primary)' },
      },
      'groups',
    ),
};
