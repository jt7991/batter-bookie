import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { gamesTable } from "./games";
import { relations } from "drizzle-orm";
import { batterTable } from "./batters";

export const battersGameInfoTable = sqliteTable(
  "batterGameInfo",
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    position: text().notNull(),
    battingOrder: integer("batting_order").notNull(),
    batterId: text("batter_id").references(() => batterTable.id),
    gameId: text("game_id").references(() => gamesTable.id),
  },
  (table) => {
    return {
      batterGameUnique: uniqueIndex("batterGameUnique").on(
        table.batterId,
        table.gameId,
      ),
    };
  },
);

export const battersGameInfoRelations = relations(
  battersGameInfoTable,
  ({ one }) => ({
    batter: one(batterTable, {
      fields: [battersGameInfoTable.batterId],
      references: [batterTable.id],
    }),
  }),
);
