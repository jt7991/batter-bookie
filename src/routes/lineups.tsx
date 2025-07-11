import { createFileRoute } from "@tanstack/react-router";
import { GameCard } from "~/components/GameTable";
import { createServerFn } from "@tanstack/react-start";
import dayjs from "dayjs";
import { between, asc } from "drizzle-orm";
import { db } from "~/server/db";
import { gamesTable } from "~/server/db/schema";

const lineupsLoader = createServerFn({ method: "GET" }).handler(async () => {
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
  return games;
});

export const Route = createFileRoute("/lineups")({
  component: RouteComponent,
  loader: () => lineupsLoader(),
});

function RouteComponent() {
  const games = Route.useLoaderData();
  console.log("games", games);
  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-4 text-white">
        {`Today\'s Games (${dayjs().format("MM/DD/YYYY")})`}
      </h2>
      <div className="grid grid-cols-1 gap-4 mb-4 text-white">
        {games.map((game) => (
          <GameCard game={game} />
        ))}
      </div>
    </div>
  );
}
