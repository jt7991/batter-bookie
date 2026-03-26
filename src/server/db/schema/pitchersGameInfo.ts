import {
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { pitchersTable } from "./pitchers";
import { gamesTable } from "./games";

export const pitchersGameInfoTable = sqliteTable(
  "pitcherGameInfo",
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    era: text().notNull(),
    winLoss: text().notNull(),
    pitcherId: text("pitcher_id").references(() => pitchersTable.id),
    gameId: text("game_id").references(() => gamesTable.id),
  },
  (table) => [uniqueIndex("pitcher_game_unique").on(table.pitcherId, table.gameId)],
);
