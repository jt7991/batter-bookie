import { useSuspenseQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { zodValidator } from "@tanstack/zod-adapter";
import { eq, and } from "drizzle-orm";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import z from "zod";
import { db } from "~/server/db";
import { pitchersGameInfoTable, pitchersTable } from "~/server/db/schema";

const getStartingPitcher = createServerFn({ method: "GET" })
  .validator(zodValidator(z.object({ teamId: z.string(), gameId: z.string() })))
  .handler(async ({ data }) => {
    return (
      (
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
      ).at(0) || null
    );
  });

export const StartingPitcherSection = ({
  gameId,
  teamId,
}: {
  gameId: string;
  teamId: string;
}) => {
  const { data: startingPitcher } = useSuspenseQuery({
    queryKey: ["getStartingPitcher", { teamId, gameId }],
    queryFn: () => getStartingPitcher({ data: { teamId, gameId } }),
  });
  const [iframeMountedOnce, setIframeMountedOnce] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isCollapsed && !iframeMountedOnce) {
      setIframeMountedOnce(true);
    }
  }, [isCollapsed]);
  return (
    <div className="flex flex-col w-full">
      <div className="mt-4 flex flex-row gap-2">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex flex-row text-sm items-center"
        >
          {isCollapsed ? <ChevronDownIcon /> : <ChevronUpIcon />}
        </button>
        <div className="flex flex-col">
          <h3 className="text-lg font-bold">
            vs. {startingPitcher?.pitcher.name} (
            {startingPitcher?.pitcher.handedness}HP)
          </h3>
          <p className="text-sm text-slate-400">
            ERA: {startingPitcher?.gameInfo.era} | W-L:{" "}
            {startingPitcher?.gameInfo.winLoss}
          </p>
        </div>
      </div>
      {(!isCollapsed || iframeMountedOnce) && (
        <div className={isCollapsed ? "hidden" : "visible"}>
          <div className="w-full">
            <div className="h-96 pt-2 overflow-auto" ref={ref}>
              <iframe
                src={`https://www.rotowire.com/${startingPitcher.pitcher.url}`}
                height={"50000"}
                className="pt-2 w-full"
                onLoad={(e) => {
                  const iframe = e.target as HTMLIFrameElement;
                  const isMobile = iframe.clientWidth < 780;
                  ref.current?.scrollTo(0, isMobile ? 150 : 200);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
