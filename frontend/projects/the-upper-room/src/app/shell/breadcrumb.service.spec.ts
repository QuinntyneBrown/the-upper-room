// traces_to: L2-011
import { describe, it, expect } from 'vitest';
import { breadcrumbsFromUrl } from './breadcrumb.service';

describe('breadcrumbsFromUrl', () => {
  it('returns [Dashboard] for the root', () => {
    expect(breadcrumbsFromUrl('/')).toEqual([{ label: 'Dashboard', url: '/' }]);
  });

  it('title-cases each segment and prepends Dashboard', () => {
    expect(breadcrumbsFromUrl('/contacts/123/edit')).toEqual([
      { label: 'Dashboard', url: '/' },
      { label: 'Contacts', url: '/contacts' },
      { label: '123', url: '/contacts/123' },
      { label: 'Edit', url: '/contacts/123/edit' },
    ]);
  });

  it('handles trailing slashes and query strings', () => {
    expect(breadcrumbsFromUrl('/partners/?q=acme')).toEqual([
      { label: 'Dashboard', url: '/' },
      { label: 'Partners', url: '/partners' },
    ]);
  });
});
