import { pgTable, uuid, timestamp, unique } from "drizzle-orm/pg-core";
import { teamsTable } from "./teams";
import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";

export const gamesTable = pgTable(
  "games",
  {
    id: uuid()
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    date: timestamp("date").notNull(),
    homeTeamId: uuid("home_team_id")
      .references(() => teamsTable.id)
      .notNull(),
    awayTeamId: uuid("away_team_id")
      .references(() => teamsTable.id)
      .notNull(),
  },
  (table) => {
    return {
      dateTeamsUnique: unique().on(
        table.date,
        table.homeTeamId,
        table.awayTeamId,
      ),
    };
  },
);

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
