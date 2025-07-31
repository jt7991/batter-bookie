import {
  pgTable,
  uuid,
  timestamp,
  unique,
  boolean,
  text,
} from "drizzle-orm/pg-core";
import { teamsTable } from "./teams";
import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";

export const gamesTable = pgTable("games", {
  id: text().primaryKey(),
  date: timestamp("date", { withTimezone: true }).notNull(),
  homeTeamId: uuid("home_team_id")
    .references(() => teamsTable.id)
    .notNull(),
  awayTeamId: uuid("away_team_id")
    .references(() => teamsTable.id)
    .notNull(),
  homeLineupConfirmed: boolean("home_lineup_confirmed").notNull().default(true),
  awayLineupConfirmed: boolean("away_lineup_confirmed").notNull().default(true),
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
