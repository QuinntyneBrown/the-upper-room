// Traces to: TASK-0210
import { Route } from '@angular/router';
import { routes } from './app.routes';

const collect = (rs: Route[]): string[] =>
  rs.flatMap((r) => [r.path ?? '', ...collect(r.children ?? [])]);

describe('app.routes (TASK-0210 cleanup)', () => {
  const paths = collect(routes);

  it('contains no debug-only routes', () => {
    expect(paths).not.toContain('echo-test');
    expect(paths).not.toContain('__throw');
    expect(paths).not.toContain('__rbac-demo');
    expect(paths).not.toContain('date-formatting-test');
  });

  it('has no path starting with "__" or ending with "-test"', () => {
    const offenders = paths.filter((p) => p.startsWith('__') || p.endsWith('-test'));
    expect(offenders).toEqual([]);
  });
});
