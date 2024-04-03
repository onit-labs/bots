import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import * as schema from "./schema";

export const libxmtpDbPath = "./bot.db";
// const libmxtpDb = new Database(libxmtpDbPath);
const appDb = new Database("./app.db");

export const db = drizzle(appDb, { schema });

migrate(db, { migrationsFolder: "./src/db/migrations" });
