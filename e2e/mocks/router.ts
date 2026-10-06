// Minimal method + path router used by the in-browser mock backend.
export type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD';

export interface MockRequest {
  readonly method: Method;
  readonly path: string;
  readonly url: URL;
  readonly query: URLSearchParams;
  readonly params: Record<string, string>;
  readonly headers: Record<string, string>;
  readonly body: unknown;
  readonly rawBody: string | null;
}

export interface MockResponse {
  status?: number;
  body?: unknown;
  headers?: Record<string, string>;
  contentType?: string;
}

export type Handler = (req: MockRequest) => MockResponse | Promise<MockResponse>;

interface RouteEntry {
  method: Method;
  segments: string[];
  handler: Handler;
}

export class Router {
  private readonly routes: RouteEntry[] = [];

  on(method: Method, pattern: string, handler: Handler): this {
    this.routes.push({ method, segments: split(pattern), handler });
    return this;
  }

  get(pattern: string, handler: Handler): this {
    return this.on('GET', pattern, handler);
  }
  post(pattern: string, handler: Handler): this {
    return this.on('POST', pattern, handler);
  }
  put(pattern: string, handler: Handler): this {
    return this.on('PUT', pattern, handler);
  }
  patch(pattern: string, handler: Handler): this {
    return this.on('PATCH', pattern, handler);
  }
  delete(pattern: string, handler: Handler): this {
    return this.on('DELETE', pattern, handler);
  }

  match(method: Method, path: string): { handler: Handler; params: Record<string, string> } | null {
    const segs = split(path);
    for (const route of this.routes) {
      if (route.method !== method || route.segments.length !== segs.length) continue;
      const params: Record<string, string> = {};
      let ok = true;
      for (let i = 0; i < segs.length; i += 1) {
        const p = route.segments[i];
        if (p.startsWith(':')) params[p.slice(1)] = decodeURIComponent(segs[i]);
        else if (p !== segs[i]) {
          ok = false;
          break;
        }
      }
      if (ok) return { handler: route.handler, params };
    }
    return null;
  }
}

function split(path: string): string[] {
  return path.split('/').filter((s) => s.length > 0);
}

export const json = (body: unknown, status = 200, headers: Record<string, string> = {}): MockResponse => ({
  status,
  body,
  headers,
});

export const noContent = (): MockResponse => ({ status: 204 });

export const notFound = (code = 'NotFound'): MockResponse => json({ code, message: 'Not found' }, 404);

export const badRequest = (code: string, message = code): MockResponse => json({ code, message }, 400);
