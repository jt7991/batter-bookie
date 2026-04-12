import axios from "axios";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { sql } from "drizzle-orm";
import { db } from "~/server/db";
import { batterOddsTable } from "~/server/db/schema/batterOdds";

dayjs.extend(utc);
dayjs.extend(timezone);

const batterNameAliases: Record<string, string> = {
  "Victor Scott II": "Victor Scott",
  "Marcelo Mayer": "Marcelo Mayer",
  "Eugenio Suárez": "Eugenio Suarez",
  "Dane Myers": "Dane Myers",
  "Luis Garcia Jr.": "Luis Garcia",
  "Joey Wiemer": "Joey Wiemer",
  "Angel Martinez": "Angel Martinez",
  "Alex Freeland": "Alex Freeland",
  "Joey Bart": "Joey Bart",
  "Luis Robert Jr.": "Luis Robert",
  "Lenyn Sosa": "Lenyn Sosa",
  "Brandon Lockridge": "Brandon Lockridge",
  "Garrett Mitchell": "Garrett Mitchell",
  "Danny Jansen": "Danny Jansen",
  "Evan Carter": "Evan Carter",
  "Trevor Larnach": "Trevor Larnach",
  "Fernando Tatis Jr.": "Fernando Tatis",
  "Javier Baez": "Javier Baez",
  "Zach McKinstry": "Zach McKinstry",
  "Isaac Paredes": "Isaac Paredes",
};

export async function refreshOdds() {
  const gamesResponse = await axios.get(
    "https://troya.xyz/api/dfm/gamesBySs?gameId=null&statistic=Hits&league=mlb",
  );
  const games = gamesResponse.data;

  const dbGames = await db.query.gamesTable.findMany({
    with: { homeTeam: true, awayTeam: true },
    where: (gamesTable, { between }) =>
      between(
        gamesTable.date,
        dayjs().tz("America/New_York").startOf("day").toDate(),
        dayjs().tz("America/New_York").endOf("day").toDate(),
      ),
  });

  let oddsEntriesUpdated = 0;

  for (const game of games) {
    const dbGame = dbGames.find(
      (candidate) =>
        candidate.homeTeam.name.toLowerCase() ===
          game.team1[0].abbreviation.toLowerCase() ||
        candidate.awayTeam.name.toLowerCase() ===
          game.team1[0].abbreviation.toLowerCase() ||
        candidate.homeTeam.name.toLowerCase() ===
          game.team2[0].abbreviation.toLowerCase() ||
        candidate.awayTeam.name.toLowerCase() === game.team2[0].abbreviation.toLowerCase(),
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
      const normalizedPlayerName = batterNameAliases[player.name] ?? player.name;
      const batter = await db.query.batterTable.findFirst({
        where: (batterTable, { eq }) => eq(batterTable.name, normalizedPlayerName),
      });

      if (!batter) {
        console.error(
          "Could not find batter in db",
          player.name,
          `-> ${normalizedPlayerName}`,
        );
        continue;
      }

      const batterGameInfo = await db.query.battersGameInfoTable.findFirst({
        where: (battersGameInfoTable, { and, eq }) =>
          and(
            eq(battersGameInfoTable.batterId, batter.id),
            eq(battersGameInfoTable.gameId, dbGame.id),
          ),
      });

      if (!batterGameInfo) {
        console.error("could not find battergameinfo");
        console.log(batter.id, dbGame.id);
        continue;
      }

      const oneHitOdds = player.markets.find((market) => market.value === 1)?.odds;
      const twoHitOdds = player.markets.find((market) => market.value === 2)?.odds;
      const threeHitOdds = player.markets.find((market) => market.value === 3)?.odds;

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
            oneHitOdds: sql`EXCLUDED."one_hit_odds"`,
            twoHitOdds: sql`EXCLUDED."two_hit_odds"`,
            threeHitOdds: sql`EXCLUDED."three_hit_odds"`,
          },
        });

      oddsEntriesUpdated += 1;
    }
  }

  return { gamesProcessed: games.length, oddsEntriesUpdated };
}
