import { createFileRoute } from "@tanstack/react-router";
import { GameCard } from "~/components/GameTable";
import { createServerFn } from "@tanstack/react-start";
import dayjs from "dayjs";
import { between, asc } from "drizzle-orm";
import { db } from "~/server/db";
import { gamesTable } from "~/server/db/schema";
import { OddsFormatToggle } from "~/components/OddsFormatToggle";
import { BetSheet } from "~/components/BetSheet";
import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";

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
  const [showStartedGames, setShowStartedGames] = useState(false);
  const now = dayjs();
  const upcomingGames = games.filter((game) => dayjs(game.date).isAfter(now));
  const startedGames = games.filter((game) => !dayjs(game.date).isAfter(now));

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
          {upcomingGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
        {startedGames.length > 0 ? (
          <div className="mt-6 rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-white">
            <button
              type="button"
              className="flex w-full items-center justify-between text-left"
              onClick={() => setShowStartedGames((current) => !current)}
            >
              <span className="text-lg font-semibold">
                Started Games ({startedGames.length})
              </span>
              {showStartedGames ? <ChevronUpIcon /> : <ChevronDownIcon />}
            </button>
            <div
              className={`grid grid-cols-1 gap-4 overflow-hidden transition-all ${showStartedGames ? "mt-4" : "mt-0 hidden"}`}
            >
              {startedGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </div>
        ) : null}
        <div className="h-20" />
      </div>
      <BetSheet />
    </>
  );
}
