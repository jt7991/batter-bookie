import "dotenv/config";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const client = createClient({
  url: process.env.DATABASE_URL ?? "file:sqlite.db",
});

void client.execute("PRAGMA journal_mode = WAL;");
void client.execute("PRAGMA foreign_keys = ON;");

export const db = drizzle(client, { schema });
