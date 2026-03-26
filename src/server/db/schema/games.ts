import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { teamsTable } from "./teams";
import { relations } from "drizzle-orm";

export const gamesTable = sqliteTable("games", {
  id: text().primaryKey(),
  date: integer("date", { mode: "timestamp" }).notNull(),
  homeTeamId: text("home_team_id")
    .references(() => teamsTable.id)
    .notNull(),
  awayTeamId: text("away_team_id")
    .references(() => teamsTable.id)
    .notNull(),
  homeLineupConfirmed: integer("home_lineup_confirmed", { mode: "boolean" })
    .notNull()
    .default(true),
  awayLineupConfirmed: integer("away_lineup_confirmed", { mode: "boolean" })
    .notNull()
    .default(true),
});

export const gamesRelations = relations(gamesTable, ({ one }) => ({
  homeTeam: one(teamsTable, {
    fields: [gamesTable.homeTeamId],
    references: [teamsTable.id],
  }),
  awayTeam: one(teamsTable, {
    fields: [gamesTable.awayTeamId],
    references: [teamsTable.id],
  }),
}));
