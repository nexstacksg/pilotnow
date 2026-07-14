// The ONE place the web app configures API access — base URL and headers
// live here. Components just call http.get / http.post / http.put / http.delete.

import { createHttpClient } from '@pilotnow/api-client';

export const http = createHttpClient({ baseUrl: '/api' });
