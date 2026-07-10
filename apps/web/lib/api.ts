// The ONE place the web app configures API access — base URL and headers
// live here. Components just call http.get / http.post / http.put / http.delete.

import { createHttpClient } from '@pilotnow/api-client';

const publicApiUrl = process.env.NEXT_PUBLIC_API_URL;

export const http = createHttpClient({
  baseUrl: publicApiUrl && !/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::|\/|$)/.test(publicApiUrl) ? publicApiUrl : '/api',
});
