import { sql } from "drizzle-orm";
import type { SQLiteColumn } from "drizzle-orm/sqlite-core";
import type { Address } from "viem";

export const sqliteAddressFromChainAwareAddress = (field: SQLiteColumn) =>
	sql<Address>`SUBSTR(${field}, INSTR(${field}, ':') + 1)`;
