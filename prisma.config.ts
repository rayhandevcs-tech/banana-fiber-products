import 'dotenv/config';
import path from 'node:path';
import { defineConfig } from 'prisma/config';

/**
 * Prisma 7 configuration.
 *
 * The connection URL lives here (not in schema.prisma) and is read from the
 * environment, so no credential is ever committed or bundled into the client.
 *
 * Read straight from `process.env` rather than through Prisma's `env()`
 * helper, which throws the moment this file is loaded if the variable is
 * unset. `prisma generate` needs only the schema — it never opens a
 * connection — but it loads this config, so the eager throw made
 * `npm install` fail outright on any machine without a database: a fresh
 * clone, a CI runner, and every Vercel build.
 *
 * Commands that genuinely need a connection (`migrate`, `db push`, `studio`)
 * still fail loudly on their own when the URL is missing, which is where that
 * error belongs.
 */
export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  migrations: {
    path: path.join('prisma', 'migrations'),
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL ?? '',
  },
});
