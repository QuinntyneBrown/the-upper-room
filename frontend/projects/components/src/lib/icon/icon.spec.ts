// traces_to: L2-007
import { describe, it, expect } from 'vitest';
import { ICON_ALIASES } from './icon-aliases';

const required = [
  'contacts',
  'partners',
  'tags',
  'notes',
  'kanban',
  'ideas',
  'events',
  'calendar',
  'locations',
  'search',
  'filter',
  'sort',
  'settings',
  'profile',
  'sign-out',
  'add',
  'edit',
  'delete',
  'archive',
  'restore',
  'close',
  'back',
  'forward',
  'up',
  'down',
  'menu',
  'more',
  'success',
  'error',
  'warning',
  'info',
  'help',
  'visibility-on',
  'visibility-off',
  'drag-handle',
];

describe('ICON_ALIASES', () => {
  it('covers every alias listed in L2-007', () => {
    for (const alias of required) {
      expect(ICON_ALIASES[alias]).toBeTruthy();
    }
  });

  it('maps contacts to person', () => {
    expect(ICON_ALIASES['contacts']).toBe('person');
  });
});
