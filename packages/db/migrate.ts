import { migrate as migrateSqlite } from "drizzle-orm/better-sqlite3/migrator";
import { migrate as migratePostgres } from "drizzle-orm/postgres-js/migrator";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import serverConfig from "@karakeep/shared/config";

if (serverConfig.database.driver === "postgres") {
  const sql = postgres(serverConfig.database.url!, {
    max: 1,
    prepare: false,
  });
  const db = drizzlePostgres(sql);

  await migratePostgres(db, { migrationsFolder: "./drizzle-pg" });
  await sql.end();
} else {
  const { db } = await import("./drizzle");

  migrateSqlite(db, { migrationsFolder: "./drizzle" });
}
