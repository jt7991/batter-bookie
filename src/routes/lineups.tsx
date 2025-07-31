import { createFileRoute } from "@tanstack/react-router";
import { GameCard } from "~/components/GameTable";
import { createServerFn } from "@tanstack/react-start";
import dayjs from "dayjs";
import { between, asc } from "drizzle-orm";
import { db } from "~/server/db";
import { gamesTable } from "~/server/db/schema";
import { OddsFormatToggle } from "~/components/OddsFormatToggle";
import { BetSheet } from "~/components/BetSheet";

const lineupsLoader = createServerFn({ method: "GET" }).handler(async () => {
  console.log("fetching games");
  const games = await db.query.gamesTable.findMany({
    where: between(
      gamesTable.date,
      dayjs().tz("America/New_York").startOf("day").toDate(),
      dayjs().tz("America/New_York").endOf("day").toDate(),
    ),
    with: {
      homeTeam: true,
      awayTeam: true,
    },
    orderBy: asc(gamesTable.date),
  });
  console.log(games);
  return games;
});

export const Route = createFileRoute("/lineups")({
  component: RouteComponent,
  loader: () => lineupsLoader(),
});

function RouteComponent() {
  const games = Route.useLoaderData();
  return (
    <>
      <div className="p-4">
        <div className="flex flex-row justify-between">
          <h2 className="text-3xl font-bold mb-4 text-white">
            {`Today\'s Games (${dayjs().format("MM/DD/YYYY")})`}
          </h2>
          <OddsFormatToggle />
        </div>
        <div className="grid grid-cols-1 gap-4 mb-4 text-white">
          {games.map((game) => (
            <GameCard game={game} />
          ))}
        </div>
      </div>
      <BetSheet />
    </>
  );
}
