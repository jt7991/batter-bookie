import { Suspense } from "react";
import { LineupSection } from "./LineupSection";
import { TEAM_COLORS } from "~/utils/team-colors";
import dayjs from "dayjs";

export const GameCard = ({
  game,
}: {
  game: {
    id: string;
    date: Date;
    homeTeam: { name: string; id: string };
    awayTeam: { name: string; id: string };
    awayLineupConfirmed: boolean;
    homeLineupConfirmed: boolean;
  };
}) => {
  return (
    <div className="bg-slate-700 shadow rounded-lg">
      <div className="mb-2 bg-slate-900 p-4 rounded-t-lg flex flex-row justify-between">
        <h2 className="font-bold text-2xl">
          {game.awayTeam.name} at {game.homeTeam.name}
        </h2>
        <h2 className="font-bold text-sm">
          {dayjs(game.date).format("h:mm A z")}
        </h2>
      </div>
      <div className="grid xl:grid-cols-2 grid-cols-1 gap-4 p-2">
        <div>
          <div
            className="p-4 rounded-t-lg "
            style={{
              backgroundColor:
                TEAM_COLORS?.[game.awayTeam.name as keyof typeof TEAM_COLORS]
                  .primary,
            }}
          >
            <h3
              className={`text-xl font-bold flex justify-between items-center ${
                TEAM_COLORS?.[game.awayTeam.name as keyof typeof TEAM_COLORS]
                  .text
              }`}
            >
              <span>{game.awayTeam.name}</span>
              <span
                title={
                  game.awayLineupConfirmed
                    ? "Away lineup confirmed"
                    : "Away lineup not confirmed"
                }
              >
                {game.awayLineupConfirmed ? "✅" : "❌"}
              </span>
            </h3>
          </div>
          <Suspense>
            <LineupSection teamId={game.awayTeam.id} gameId={game.id} />
          </Suspense>
        </div>
        <div>
          <div
            className="p-4 rounded-t-lg "
            style={{
              backgroundColor:
                TEAM_COLORS?.[game.homeTeam.name as keyof typeof TEAM_COLORS]
                  .primary,
            }}
          >
            <h3
              className={`text-xl font-bold flex justify-between items-center ${
                TEAM_COLORS?.[game.homeTeam.name as keyof typeof TEAM_COLORS]
                  .text
              }`}
            >
              <span>{game.homeTeam.name}</span>
              <span
                title={
                  game.homeLineupConfirmed
                    ? "Home lineup confirmed"
                    : "Home lineup not confirmed"
                }
              >
                {game.homeLineupConfirmed ? "✅" : "❌"}
              </span>
            </h3>
          </div>
          <Suspense>
            <LineupSection teamId={game.homeTeam.id} gameId={game.id} />
          </Suspense>
        </div>
      </div>
    </div>
  );
};
