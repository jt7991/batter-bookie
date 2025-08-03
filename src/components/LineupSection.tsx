import { useSuspenseQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { zodValidator } from "@tanstack/zod-adapter";
import { and, eq } from "drizzle-orm";
import z from "zod";
import { db } from "~/server/db";
import {
  batterOddsTable,
  battersGameInfoTable,
  batterTable,
  pitchersGameInfoTable,
  pitchersTable,
} from "~/server/db/schema";
import { BatterRow } from "./BatterRow";
import { StartingPitcherSection } from "./StartingPitcherSection";

const getTeamLineupForGame = createServerFn({ method: "GET" })
  .validator(zodValidator(z.object({ teamId: z.string(), gameId: z.string() })))
  .handler(async ({ data }) => {
    const bgInfo = await db
      .select({
        batter: batterTable,
        gameInfo: battersGameInfoTable,
        odds: batterOddsTable,
      })
      .from(battersGameInfoTable)
      .innerJoin(batterTable, eq(battersGameInfoTable.batterId, batterTable.id))
      .leftJoin(
        batterOddsTable,
        eq(batterOddsTable.batterGameInfoId, battersGameInfoTable.id),
      )
      .where(
        and(
          eq(battersGameInfoTable.gameId, data.gameId),
          eq(batterTable.teamId, data.teamId),
        ),
      )
      .orderBy(battersGameInfoTable.battingOrder);
    return Array.from({ length: 9 }).map((_, index) => {
      return bgInfo.find((batter) => batter.gameInfo.battingOrder === index);
    });
  });

export const LineupSection = ({
  opposingTeamId,
  teamId,
  gameId,
}: {
  opposingTeamId: string;
  teamId: string;
  gameId: string;
}) => {
  const { data: teamLineup } = useSuspenseQuery({
    queryKey: ["getTeamLineupForGame", { teamId, gameId }],
    queryFn: () => getTeamLineupForGame({ data: { teamId, gameId } }),
  });

  return (
    <div>
      <StartingPitcherSection teamId={opposingTeamId} gameId={gameId} />
      <table className="w-full border-separate border-spacing-y-4 mt-2">
        <thead>
          <tr className="border-b-2 border-slate-400 text-sm text-left">
            <th className="w-24 text-center"></th>
            <th></th>
            <th className="w-10 text-center">H</th>
            <th className="w-12 text-center hidden sm:table-cell">Pos</th>
            <th className="text-center">1+ Hits</th>
            <th className="text-center">2+ Hits</th>
            <th className="text-center">3+ Hits</th>
          </tr>
        </thead>
        <tbody>
          {teamLineup.map((item, index) =>
            item ? (
              <BatterRow
                batter={item.batter}
                key={item.batter.id}
                gameInfo={item.gameInfo}
                odds={item.odds}
              />
            ) : null,
          )}
        </tbody>
      </table>
    </div>
  );
};
