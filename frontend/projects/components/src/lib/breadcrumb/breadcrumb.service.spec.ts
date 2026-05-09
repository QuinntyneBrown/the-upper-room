// traces_to: L2-011
import { breadcrumbsFromUrl } from './breadcrumb.service';

describe('breadcrumbsFromUrl (components library)', () => {
  it('returns Dashboard crumb for root URL', () => {
    const crumbs = breadcrumbsFromUrl('/');
    expect(crumbs).toEqual([{ label: 'Dashboard', url: '/' }]);
  });

  it('splits URL segments and title-cases labels', () => {
    const crumbs = breadcrumbsFromUrl('/contacts');
    expect(crumbs).toHaveLength(2);
    expect(crumbs[1]).toEqual({ label: 'Contacts', url: '/contacts' });
  });

  it('leaves numeric segments unchanged (not title-cased)', () => {
    const crumbs = breadcrumbsFromUrl('/contacts/123');
    expect(crumbs[2]).toEqual({ label: '123', url: '/contacts/123' });
  });

  it('ignores query string when building URLs', () => {
    const crumbs = breadcrumbsFromUrl('/contacts?page=2');
    expect(crumbs).toHaveLength(2);
    expect(crumbs[1]!.url).toBe('/contacts');
  });

  it('handles multi-segment paths', () => {
    const crumbs = breadcrumbsFromUrl('/contacts/new');
    expect(crumbs).toHaveLength(3);
    expect(crumbs[2]).toEqual({ label: 'New', url: '/contacts/new' });
  });
});
