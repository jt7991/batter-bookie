import { createServerFn } from "@tanstack/react-start";
import { zodValidator } from "@tanstack/zod-adapter";
import z from "zod";
import { db } from "~/server/db";
import { batterOddsTable } from "~/server/db/schema";
import { eq } from "drizzle-orm";

const getTeamLineupForGame = createServerFn({ method: "GET" })
  .validator(zodValidator(z.object({ gameInfoId: z.string() })))
  .handler(async ({ data }) => {
    return (
      await db
        .select()
        .from(batterOddsTable)
        .where(eq(batterOddsTable.batterGameInfoId, data.gameInfoId))
    ).at(0);
  });

export const useOdds = (oddsEntryId: string) => {};
