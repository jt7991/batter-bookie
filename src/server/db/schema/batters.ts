import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { teamsTable } from "./teams";

export const batterTable = pgTable("batters", {
  id: varchar({ length: 255 }).primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  teamId: uuid().references(() => teamsTable.id),
  handedness: varchar({ length: 255 }).notNull(),
  url: varchar({ length: 255 }).notNull(),
});
