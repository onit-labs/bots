import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import * as schema from "./schema";

export const libxmtpDbPath = "./data/bot.db";
// const libmxtpDb = new Database(libxmtpDbPath);
const appDb = new Database("./data/app.db");

export const db = drizzle(appDb, { schema });

migrate(db, { migrationsFolder: "./src/db/migrations" });
