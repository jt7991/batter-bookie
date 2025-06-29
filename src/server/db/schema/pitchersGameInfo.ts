import { pgTable, unique, uuid, varchar } from "drizzle-orm/pg-core";
import { pitchersTable } from "./pitchers";
import { gamesTable } from "./games";
import { sql } from "drizzle-orm";

export const pitchersGameInfoTable = pgTable(
  "pitcherGameInfo",
  {
    id: uuid()
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    era: varchar({ length: 255 }).notNull(),
    winLoss: varchar({ length: 255 }).notNull(),
    pitcherId: varchar({ length: 255 }).references(() => pitchersTable.id),
    gameId: uuid().references(() => gamesTable.id),
  },
  (table) => [unique().on(table.pitcherId, table.gameId)],
);
