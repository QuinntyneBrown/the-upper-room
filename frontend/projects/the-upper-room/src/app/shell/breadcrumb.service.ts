// traces_to: L2-011
export interface Crumb {
  readonly label: string;
  readonly url: string;
}

export function breadcrumbsFromUrl(url: string): Crumb[] {
  const path = url.split('?')[0]!;
  const segments = path.split('/').filter(Boolean);
  const crumbs: Crumb[] = [{ label: 'Dashboard', url: '/' }];
  let acc = '';
  for (const segment of segments) {
    acc += '/' + segment;
    crumbs.push({ label: titleCase(segment), url: acc });
  }
  return crumbs;
}

function titleCase(s: string): string {
  if (/^\d+$/.test(s)) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}
