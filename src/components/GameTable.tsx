import { Suspense, useState } from "react";
import { LineupSection } from "./LineupSection";
import { TEAM_COLORS } from "~/utils/team-colors";
import dayjs from "dayjs";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import TeamLogo from "./TeamLogo";

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
  const [isCollapsed, setIsCollapsed] = useState(true);
  return (
    <div className="flex flex-col w-full">
      <h2 className="font-bold text-sm p-2 py-0 pb-1">
        {dayjs(game.date).format("h:mm A z")}
      </h2>
      <div className="bg-slate-700 shadow rounded-lg">
        <div
          className={`bg-slate-900 p-4 ${isCollapsed ? "rounded-lg" : "rounded-t-lg"} flex flex-col`}
        >
          <div className="flex flex-row gap-2">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="flex flex-row text-sm items-center"
            >
              {isCollapsed ? <ChevronDownIcon /> : <ChevronUpIcon />}
            </button>
            <h2 className="font-bold text-lg flex flex-row gap-4 items-center">
              <div className="flex flex-row gap-0 items-center">
                <TeamLogo teamId={game.awayTeam.name} />
                {game.awayTeam.name}
              </div>
              at
              <div className="flex flex-row gap-0 items-center">
                <TeamLogo teamId={game.homeTeam.name} />
                {game.homeTeam.name}
              </div>
            </h2>
          </div>
        </div>
        <div
          className={`grid xl:grid-cols-2 grid-cols-1 gap-4 p-2 ${isCollapsed ? "hidden" : ""}`}
        >
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
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <TeamLogo teamId={game.awayTeam.name?.toLowerCase()} />
                  <span>{game.awayTeam.name}</span>
                </div>
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
              <LineupSection
                teamId={game.awayTeam.id}
                opposingTeamId={game.homeTeam.id}
                gameId={game.id}
              />
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
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <TeamLogo teamId={game.homeTeam.name?.toLowerCase()} />
                  <span>{game.homeTeam.name}</span>
                </div>
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
              <LineupSection
                teamId={game.homeTeam.id}
                opposingTeamId={game.awayTeam.id}
                gameId={game.id}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
};
