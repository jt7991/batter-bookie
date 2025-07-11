import {
  pgTable,
  unique,
  uuid,
  varchar,
  smallint,
  text,
} from "drizzle-orm/pg-core";
import { pitchersTable } from "./pitchers";
import { gamesTable } from "./games";
import { relations, sql } from "drizzle-orm";
import { batterTable } from "./batters";

export const battersGameInfoTable = pgTable("batterGameInfo", {
  id: uuid()
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  position: varchar({ length: 255 }).notNull(),
  battingOrder: smallint().notNull(),
  batterId: varchar({ length: 255 }).references(() => batterTable.id),
  gameId: text().references(() => gamesTable.id),
});

export const battersGameInfoRelations = relations(
  battersGameInfoTable,
  ({ one }) => ({
    batter: one(batterTable, {
      fields: [battersGameInfoTable.batterId],
      references: [batterTable.id],
    }),
  }),
);
