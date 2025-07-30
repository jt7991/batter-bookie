import { db } from "../src/server/db";
import { batterOddsTable } from "../src/server/db/schema/batterOdds";
import axios from "axios";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { sql } from "drizzle-orm";

dayjs.extend(utc);
dayjs.extend(timezone);

const main = async () => {
  const gamesResponse = await axios.get(
    "https://troya.xyz/api/dfm/gamesBySs?gameId=null&statistic=Hits&league=mlb",
  );
  const games = gamesResponse.data;

  const dbGames = await db.query.gamesTable.findMany({
    with: { homeTeam: true, awayTeam: true },
    where: (games, { between }) =>
      between(
        games.date,
        dayjs().tz("America/New_York").startOf("day").toDate(),
        dayjs().tz("America/New_York").endOf("day").toDate(),
      ),
  });

  for (const game of games) {
    const dbGame = dbGames.find(
      (g) =>
        g.homeTeam.name.toLowerCase() ===
          game.team1[0].abbreviation.toLowerCase() ||
        g.awayTeam.name.toLowerCase() ===
          game.team1[0].abbreviation.toLowerCase() ||
        g.homeTeam.name.toLowerCase() ===
          game.team2[0].abbreviation.toLowerCase() ||
        g.awayTeam.name.toLowerCase() ===
          game.team2[0].abbreviation.toLowerCase(),
    );
    if (!dbGame) {
      console.error("Could not find game");
      continue;
    }
    const marketsResponse = await axios.get(
      `https://troya.xyz/api/dfm/marketsBySs?sb=mybookie&gameId=${game.providers[0].id}&statistic=Hits`,
    );
    const markets = marketsResponse.data;

    for (const player of markets[0].players) {
      const batter = await db.query.batterTable.findFirst({
        where: (batter, { eq }) => eq(batter.name, player.name),
      });
      if (!batter) {
        console.error("Could not find batter in db", player.name);
        continue;
      }

      if (batter) {
        const batterGameInfo = await db.query.battersGameInfoTable.findFirst({
          where: (batterGameInfo, { eq, and }) =>
            and(
              eq(batterGameInfo.batterId, batter.id),
              eq(batterGameInfo.gameId, dbGame.id),
            ),
        });
        if (!batterGameInfo) {
          console.error("could not find battergameinfo");
        }

        if (batterGameInfo) {
          const oneHitOdds = player.markets.find((m) => m.value === 1)?.odds;
          const twoHitOdds = player.markets.find((m) => m.value === 2)?.odds;
          const threeHitOdds = player.markets.find((m) => m.value === 3)?.odds;

          await db
            .insert(batterOddsTable)
            .values({
              id: batterGameInfo.id,
              batterGameInfoId: batterGameInfo.id,
              oneHitOdds,
              twoHitOdds,
              threeHitOdds,
            })
            .onConflictDoUpdate({
              target: batterOddsTable.id,
              set: {
                oneHitOdds: sql`EXCLUDED."oneHitOdds"`,
                twoHitOdds: sql`EXCLUDED."twoHitOdds"`,
                threeHitOdds: sql`EXCLUDED."threeHitOdds"`,
              },
            });
        }
      }
    }
  }
};

main();
