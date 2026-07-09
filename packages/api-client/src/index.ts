// Shared HTTP client for the PilotNow Web API.
// Base URL, JSON headers, and response parsing are handled ONCE here —
// call sites never repeat them:
//
//   const http = createHttpClient({ baseUrl: 'http://localhost:4000' });
//   const jobs = await http.get<JobList>('/jobs');
//   const job  = await http.post<Job>('/jobs', { siteId, startAt, ... });
//   await http.put(`/jobs/${id}`, { instructions });
//   await http.delete(`/jobs/${id}`);

export interface HttpClientOptions {
  baseUrl: string;
  /** Default headers sent on every request (e.g. auth). Set once, never repeated. */
  headers?: Record<string, string>;
  /** Custom fetch (e.g. Next.js fetch with caching options). */
  fetch?: typeof globalThis.fetch;
}

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly method: string,
    public readonly path: string,
    public readonly body: unknown,
  ) {
    super(`${method} ${path} failed with ${status}`);
    this.name = 'HttpError';
  }
}

export interface HttpClient {
  get<T = unknown>(path: string): Promise<T>;
  post<T = unknown>(path: string, body?: unknown): Promise<T>;
  put<T = unknown>(path: string, body?: unknown): Promise<T>;
  patch<T = unknown>(path: string, body?: unknown): Promise<T>;
  delete<T = unknown>(path: string): Promise<T>;
}

export function createHttpClient(options: HttpClientOptions): HttpClient {
  const baseUrl = options.baseUrl.replace(/\/+$/, '');
  const defaultHeaders = options.headers ?? {};
  const fetchFn = options.fetch ?? globalThis.fetch;

  async function request<T>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<T> {
    const res = await fetchFn(`${baseUrl}${path}`, {
      method,
      headers: {
        accept: 'application/json',
        ...(body !== undefined ? { 'content-type': 'application/json' } : {}),
        ...defaultHeaders,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const payload =
      res.status === 204 ? undefined : await res.json().catch(() => undefined);

    if (!res.ok) {
      throw new HttpError(res.status, method, path, payload);
    }
    return payload as T;
  }

  return {
    get: (path) => request('GET', path),
    post: (path, body) => request('POST', path, body),
    put: (path, body) => request('PUT', path, body),
    patch: (path, body) => request('PATCH', path, body),
    delete: (path) => request('DELETE', path),
  };
}

/** Client acting under an AGENT identity (FR-035) — for agent-side callers. */
export function createAgentHttpClient(
  options: HttpClientOptions & { agentToken: string },
): HttpClient {
  const { agentToken, headers = {}, ...rest } = options;
  return createHttpClient({
    ...rest,
    headers: { ...headers, 'x-agent-token': agentToken },
  });
}
