import axios from "axios";
import * as cheerio from "cheerio";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone.js";
import utc from "dayjs/plugin/utc.js";
import { and, eq, notInArray, sql } from "drizzle-orm";
import { db } from "~/server/db";
import { batterTable } from "~/server/db/schema/batters";
import { battersGameInfoTable } from "~/server/db/schema/battersGameInfo";
import { gamesTable } from "~/server/db/schema/games";
import { pitchersTable } from "~/server/db/schema/pitchers";
import { pitchersGameInfoTable } from "~/server/db/schema/pitchersGameInfo";
import { teamsTable } from "~/server/db/schema/teams";

dayjs.extend(utc);
dayjs.extend(timezone);

const ROTOWIRE_URL = "https://www.rotowire.com/baseball/daily-lineups.php";

interface Player {
  url: string;
  id: string;
  name: string;
  position: string;
  battingOrder: number;
  handed: string;
}

interface Team {
  name: string;
  players: Player[];
  startingPitcher: string;
  startingPitcherEra: string;
  startingPitcherWinLoss: string;
  startingPitcherThrows: string;
  pitcherId: string;
  pitcherLink: string;
  lineupConfirmed: boolean;
}

interface Game {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  date: number;
}

async function scrapeLineups(): Promise<Game[]> {
  try {
    const response = await axios.get(ROTOWIRE_URL);
    const $ = cheerio.load(response.data);
    const games: Game[] = [];

    function getTeamAndPlayers(
      isVisiting: boolean,
      gameElement: cheerio.Cheerio<any>,
    ) {
      const classText = isVisiting ? "is-visit" : "is-home";
      // Process teams
      //lineup__player-highlight-stats
      const [winLoss, era] = gameElement
        .find(
          `.lineup__list.${classText} > .lineup__player-highlight > .lineup__player-highlight-stats`,
        )
        .text()
        .trim()
        .split("\u00A0"); // Split on non-breaking space

      const pitcherLink = gameElement
        .find(
          `.lineup__list.${classText} > .lineup__player-highlight > .lineup__player-highlight-name > a`,
        )
        .prop("href");

      //lineup__status is-confirmed
      const confirmed = gameElement
        .find(`.lineup__list.${classText} > .lineup__status`)
        .hasClass("is-confirmed");

      const pitcherId = pitcherLink?.split("-").at(-1);
      const team: Team = {
        name: gameElement.find(`.lineup__team.${classText}`).text().trim(),
        players: [],
        lineupConfirmed: confirmed,
        startingPitcher: gameElement
          .find(
            `.lineup__list.${classText} > .lineup__player-highlight > .lineup__player-highlight-name > a`,
          )
          .text()
          .trim(),
        startingPitcherThrows: gameElement
          .find(
            `.lineup__list.${classText} > .lineup__player-highlight > .lineup__player-highlight-name > span`,
          )
          .text()
          .trim(),
        startingPitcherEra: era,
        startingPitcherWinLoss: winLoss,
        pitcherId: pitcherId!,
        pitcherLink: pitcherLink || "",
      };

      if (!team.name) return;
      gameElement
        .find(`.lineup__list.${classText} > .lineup__player`)
        .each((index, playerElement) => {
          const position = $(playerElement).find(".lineup__pos").text().trim();
          const name = $(playerElement).find("a").prop("title");
          const handed = $(playerElement).find(".lineup__bats").text().trim();
          const url = $(playerElement).find("a").attr("href") || "";
          const id = url?.split("-").at(-1)!;

          team.players.push({
            name,
            position,
            handed,
            battingOrder: index,
            id,
            url,
          });
        });
      return team;
    }
    // Each lineup container
    $(".lineup.is-mlb").each((_, element) => {
      const gameElement = $(element);
      const timeString = gameElement
        .find(".lineup__meta > .lineup__time")
        .text()
        .trim()
        .replace(" ET", "");

      const timeRegex = /^\d{1,2}:\d{2} (AM|PM)$/;
      if (!timeRegex.test(timeString)) {
        return;
      }

      const today = dayjs().format("YYYY-MM-DD");
      const gameDate = dayjs(`${today} ${timeString}`, "YYYY-MM-DD h:mm A");
      console.log(today, timeString);
      console.log(gameDate.utc().format());

      if (!gameDate.isValid()) {
        console.error(`Failed to parse date for timeString: "${timeString}"`);
        return;
      }
      const game = {
        id: $(element)
          .find("div.lineup__box > a")
          .attr("href")
          ?.split("/")
          .at(-1),
        homeTeam: getTeamAndPlayers(false, gameElement),
        awayTeam: getTeamAndPlayers(true, gameElement),
        date: gameDate.valueOf(),
      };
      if (game.homeTeam && game.awayTeam) {
        games.push(game as Game);
      }
    });

    return games;
  } catch (error) {
    console.error("Error scraping lineups:", error);
    throw error;
  }
}

async function main() {
  const games = await scrapeLineups();
  for (const game of games) {
    try {
      await db.transaction(async (tx) => {
        await tx
          .insert(teamsTable)
          .values([{ name: game.homeTeam.name }, { name: game.awayTeam.name }])
          .onConflictDoNothing();
        const [homeTeam] = await tx
          .select()
          .from(teamsTable)
          .where(eq(teamsTable.name, game.homeTeam.name))
          .limit(1);

        if (!homeTeam) {
          console.error(`Home team ${game.homeTeam.name} not found`);
          return;
        }

        const [awayTeam] = await tx
          .select()
          .from(teamsTable)
          .where(eq(teamsTable.name, game.awayTeam.name))
          .limit(1);

        if (!awayTeam) {
          console.error(`Away team ${game.awayTeam.name} not found`);
          return;
        }

        await tx
          .insert(gamesTable)
          .values([
            {
              id: game.id,
              date: new Date(game.date),
              homeTeamId: homeTeam.id,
              awayTeamId: awayTeam.id,
              homeLineupConfirmed: game.homeTeam.lineupConfirmed,
              awayLineupConfirmed: game.awayTeam.lineupConfirmed,
            },
          ])
          .onConflictDoUpdate({
            target: [gamesTable.id],
            set: {
              date: sql`EXCLUDED."date"`,
              homeLineupConfirmed: sql`EXCLUDED."home_lineup_confirmed"`,
              awayLineupConfirmed: sql`EXCLUDED."away_lineup_confirmed"`,
            },
          });

        const [gameDb] = await tx
          .select()
          .from(gamesTable)
          .where(
            and(
              eq(gamesTable.homeTeamId, homeTeam.id),
              eq(gamesTable.awayTeamId, awayTeam.id),
              eq(gamesTable.date, new Date(game.date)),
            ),
          )
          .limit(1);
        const [homePitcher, awayPitcher] = await tx
          .insert(pitchersTable)
          .values([
            {
              name: game.homeTeam.startingPitcher,
              handedness: game.homeTeam.startingPitcherThrows,
              teamId: homeTeam.id,
              id: game.homeTeam.pitcherId,
              url: game.homeTeam.pitcherLink,
            },
            {
              name: game.awayTeam.startingPitcher,
              handedness: game.awayTeam.startingPitcherThrows,
              teamId: awayTeam.id,
              id: game.awayTeam.pitcherId,
              url: game.awayTeam.pitcherLink,
            },
          ])
          .onConflictDoUpdate({
            target: pitchersTable.id,
            set: {
              name: sql`EXCLUDED.name`,
              handedness: sql`EXCLUDED.handedness`,
              teamId: sql`EXCLUDED."teamId"`,
              url: sql`EXCLUDED."url"`,
            },
          })
          .returning();

        await tx
          .insert(pitchersGameInfoTable)
          .values([
            {
              era: game.homeTeam.startingPitcherEra,
              winLoss: game.homeTeam.startingPitcherWinLoss,
              pitcherId: homePitcher.id,
              gameId: gameDb.id,
            },
            {
              era: game.awayTeam.startingPitcherEra,
              winLoss: game.awayTeam.startingPitcherWinLoss,
              pitcherId: awayPitcher.id,
              gameId: gameDb.id,
            },
          ])
          .onConflictDoUpdate({
            target: [
              pitchersGameInfoTable.pitcherId,
              pitchersGameInfoTable.gameId,
            ],
            set: {
              era: sql`EXCLUDED.era`,
              winLoss: sql`EXCLUDED."winLoss"`,
            },
          });
        await tx
          .insert(batterTable)
          .values(
            game.homeTeam.players.map((player) => {
              return {
                id: player.id,
                name: player.name,
                teamId: homeTeam.id,
                handedness: player.handed,
                url: player.url,
              };
            }),
          )
          .onConflictDoUpdate({
            target: batterTable.id,
            set: {
              name: sql`EXCLUDED.name`,
              handedness: sql`EXCLUDED.handedness`,
              teamId: sql`EXCLUDED."teamId"`,
              url: sql`EXCLUDED."url"`,
            },
          })
          .returning();
        await tx
          .insert(batterTable)
          .values(
            game.awayTeam.players.map((player) => {
              return {
                id: player.id,
                name: player.name,
                teamId: awayTeam.id,
                handedness: player.handed,
                url: player.url,
              };
            }),
          )
          .onConflictDoUpdate({
            target: batterTable.id,
            set: {
              name: sql`EXCLUDED.name`,
              handedness: sql`EXCLUDED.handedness`,
              teamId: sql`EXCLUDED."teamId"`,
              url: sql`EXCLUDED."url"`,
            },
          })
          .returning();

        const allPlayers = [...game.homeTeam.players, ...game.awayTeam.players];
        await tx.delete(battersGameInfoTable).where(
          and(
            eq(battersGameInfoTable.gameId, gameDb.id),
            notInArray(
              battersGameInfoTable.batterId,
              allPlayers.map((p) => p.id),
            ),
          ),
        );
        await tx
          .insert(battersGameInfoTable)
          .values(
            allPlayers.map((player) => {
              return {
                batterId: player.id,
                gameId: gameDb.id,
                battingOrder: player.battingOrder,
                position: player.position,
              };
            }),
          )
          .onConflictDoUpdate({
            target: [
              battersGameInfoTable.batterId,
              battersGameInfoTable.gameId,
            ],
            set: {
              battingOrder: sql`EXCLUDED."battingOrder"`,
              position: sql`EXCLUDED.position`,
            },
          });
      });
    } catch (err) {
      console.error(err);
    }
  }
}

main();
