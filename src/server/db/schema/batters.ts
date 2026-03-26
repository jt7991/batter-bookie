import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { teamsTable } from "./teams";

export const batterTable = sqliteTable("batters", {
  id: text().primaryKey(),
  name: text().notNull(),
  teamId: text().references(() => teamsTable.id),
  handedness: text().notNull(),
  url: text().notNull(),
});
