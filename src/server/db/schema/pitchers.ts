import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { teamsTable } from "./teams";

export const pitchersTable = pgTable("pitchers", {
  id: varchar({ length: 255 }).primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  teamId: uuid().references(() => teamsTable.id),
  handedness: varchar({ length: 255 }).notNull(),
  url: varchar({ length: 255 }).notNull(),
});
