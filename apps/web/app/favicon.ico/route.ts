const favicon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#2563eb"/>
  <path d="M20 16h15c9 0 15 5 15 13s-6 13-15 13h-5v8H20V16Zm10 9v8h5c3 0 5-1 5-4s-2-4-5-4h-5Z" fill="white"/>
</svg>
`.trim();

export function GET() {
  return new Response(favicon, {
    headers: {
      'Cache-Control': 'public, max-age=86400',
      'Content-Type': 'image/svg+xml',
    },
  });
}
