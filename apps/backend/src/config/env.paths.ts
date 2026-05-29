import { existsSync } from 'fs';
import { resolve } from 'path';

/**
 * Resolve .env files regardless of whether the process is started from
 * the monorepo root or apps/backend (Nest dev/prod).
 */
export function resolveEnvFilePaths(): string[] {
  const candidates = [
    resolve(__dirname, '../../../../.env'),
    resolve(__dirname, '../../../.env'),
    resolve(process.cwd(), '../../.env'),
    resolve(process.cwd(), '.env'),
  ];

  return candidates.filter((path, index, all) => existsSync(path) && all.indexOf(path) === index);
}
