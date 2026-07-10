import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

function findUp(name: string) {
  let dir = process.cwd();
  while (true) {
    const candidate = join(dir, name);
    if (existsSync(candidate)) return candidate;
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

export function loadEnv(file = '.env') {
  const path = file.includes('/') ? resolve(process.cwd(), file) : findUp(file);
  if (!path || !existsSync(path)) return;

  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const index = trimmed.indexOf('=');
    if (index === -1) continue;

    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^['"]|['"]$/g, '');
    process.env[key] = value;
  }
}
