# Postgres and CNPG Port

Karakeep remains SQLite-first by default for upstream compatibility, but this
fork now has an initial Postgres runtime path for CNPG-backed deployments. CNPG
support is not a Helm-only change because the database package needs a
Postgres-specific Drizzle schema, migration history, and runtime client.

## Current Boundaries

- `packages/db/schema.sqlite.ts` contains the current SQLite Drizzle schema.
- `packages/db/schema.pg.ts` contains the matching Postgres Drizzle schema.
- `packages/db/schema.ts` remains the public schema import path for existing
  application code.
- `packages/shared/config.ts` exposes `DB_DRIVER=sqlite|postgres` and
  `DATABASE_URL`; SQLite remains the default.
- `packages/db/drizzle.config.ts` selects SQLite generation output by default
  and Postgres generation output when `DB_DRIVER=postgres`.
- `packages/db/drizzle.ts` owns the live database connection. SQLite uses
  `better-sqlite3`; Postgres uses the `postgres` client with prepared
  statements disabled for CNPG pooler compatibility.
- `packages/db/migrate.ts` runs SQLite migrations from `packages/db/drizzle`
  and Postgres migrations from `packages/db/drizzle-pg`.

## Porting Plan

1. Keep SQLite as the default backend for upstream compatibility.
2. Add explicit database selection through environment config:
   `DB_DRIVER=sqlite|postgres` and `DATABASE_URL`.
3. Add a Postgres Drizzle schema using `drizzle-orm/pg-core`, preserving table
   and column names where possible. Done.
4. Add Postgres migrations generated from the Postgres schema; do not reuse
   SQLite migration SQL. Initial migration is in `packages/db/drizzle-pg`.
5. Replace exported SQLite-specific types and errors with database-neutral
   helpers.
6. Audit raw SQL and SQLite JSON functions before declaring the full app
   production-ready on Postgres.
7. Add broader tests that run representative web and worker flows against
   Postgres before publishing a custom image.

## Notes

The app uses `await` around most database operations already, which helps the
async Postgres client path. The current implementation is enough to create the
schema, run migrations, and execute a simple insert/query smoke test against
DHI Postgres. Remaining risk is in higher-level application behavior: raw SQL,
SQLite-specific JSON assumptions, transaction typing, and worker flows still
need broader verification before deploying Karakeep on CNPG.
