import { pgTable, uuid, decimal } from "drizzle-orm/pg-core";
import { battersGameInfoTable } from "./battersGameInfo";
import { relations, sql } from "drizzle-orm";

export const batterOddsTable = pgTable("batter_odds", {
  id: uuid()
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  batterGameInfoId: uuid(),
  oneHitOdds: decimal("one_hit_odds", { precision: 10, scale: 2 }),
  twoHitOdds: decimal("two_hit_odds", { precision: 10, scale: 2 }),
  threeHitOdds: decimal("three_hit_odds", { precision: 10, scale: 2 }),
});

export const batterOddsRelations = relations(batterOddsTable, ({ one }) => ({
  batterGameInfo: one(battersGameInfoTable, {
    fields: [batterOddsTable.batterGameInfoId],
    references: [battersGameInfoTable.id],
  }),
}));

