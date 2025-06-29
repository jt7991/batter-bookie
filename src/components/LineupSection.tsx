import { useSuspenseQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { zodValidator } from "@tanstack/zod-adapter";
import { and, eq } from "drizzle-orm";
import z from "zod";
import { db } from "~/server/db";
import {
  battersGameInfoTable,
  batterTable,
  pitchersGameInfoTable,
  pitchersTable,
} from "~/server/db/schema";
import { BatterRow } from "./BatterRow";

const getTeamLineupForGame = createServerFn({ method: "GET" })
  .validator(zodValidator(z.object({ teamId: z.string(), gameId: z.string() })))
  .handler(async ({ data }) => {
    const bgInfo = await db
      .select({ batter: batterTable, gameInfo: battersGameInfoTable })
      .from(battersGameInfoTable)
      .innerJoin(batterTable, eq(battersGameInfoTable.batterId, batterTable.id))
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

const getStartingPitcher = createServerFn({ method: "GET" })
  .validator(zodValidator(z.object({ teamId: z.string(), gameId: z.string() })))
  .handler(async ({ data }) => {
    return (
      await db
        .select({ pitcher: pitchersTable, gameInfo: pitchersGameInfoTable })
        .from(pitchersGameInfoTable)
        .innerJoin(
          pitchersTable,
          eq(pitchersGameInfoTable.pitcherId, pitchersTable.id),
        )
        .where(
          and(
            eq(pitchersGameInfoTable.gameId, data.gameId),
            eq(pitchersTable.teamId, data.teamId),
          ),
        )
        .limit(1)
    ).at(0);
  });

export const LineupSection = ({
  teamId,
  gameId,
}: {
  teamId: string;
  gameId: string;
}) => {
  const { data: teamLineup } = useSuspenseQuery({
    queryKey: ["getTeamLineupForGame", { teamId, gameId }],
    queryFn: () => getTeamLineupForGame({ data: { teamId, gameId } }),
  });

  const { data: startingPitcher } = useSuspenseQuery({
    queryKey: ["getStartingPitcher", { teamId, gameId }],
    queryFn: () => getStartingPitcher({ data: { teamId, gameId } }),
  });

  return (
    <div>
      <div className="m-4 p-4 rounded-md flex flex-row justify-between gap-2 border-2 bg-slate-600">
        <p>
          {startingPitcher?.pitcher.name} -{" "}
          {startingPitcher?.pitcher.handedness}HP
        </p>
        <div className="flex flex-col ">
          <p className="text-sm"> {startingPitcher?.gameInfo.era}</p>
          <p className="text-sm">W-L: {startingPitcher?.gameInfo.winLoss}</p>
        </div>
      </div>
      {teamLineup.map((item, index) =>
        item ? (
          <BatterRow
            batter={item.batter}
            key={item.batter.id}
            gameInfo={item.gameInfo}
          />
        ) : null,
      )}
    </div>
  );
};
