import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const teamsTable = sqliteTable("teams", {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text().notNull().unique(),
});
