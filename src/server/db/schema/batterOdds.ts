import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { battersGameInfoTable } from "./battersGameInfo";
import { relations } from "drizzle-orm";

export const batterOddsTable = sqliteTable("batter_odds", {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  batterGameInfoId: text("batter_game_info_id"),
  oneHitOdds: text("one_hit_odds"),
  twoHitOdds: text("two_hit_odds"),
  threeHitOdds: text("three_hit_odds"),
});

export const batterOddsRelations = relations(batterOddsTable, ({ one }) => ({
  batterGameInfo: one(battersGameInfoTable, {
    fields: [batterOddsTable.batterGameInfoId],
    references: [battersGameInfoTable.id],
  }),
}));
