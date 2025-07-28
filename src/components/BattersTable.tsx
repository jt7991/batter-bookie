import { useSuspenseQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { zodValidator } from "@tanstack/zod-adapter";
import { AgGridReact } from "ag-grid-react";
import { and, eq } from "drizzle-orm";
import z from "zod";
import { db } from "~/server/db";
import {
  batterOddsTable,
  battersGameInfoTable,
  batterTable,
} from "~/server/db/schema";
import { themeQuartz } from "ag-grid-community";
import { BatterIFrame } from "./BatterIFrame";

// to use myTheme in an application, pass it to the theme grid option
const myTheme = themeQuartz.withParams({
  backgroundColor: "#1f2836",
  browserColorScheme: "dark",
  chromeBackgroundColor: {
    ref: "foregroundColor",
    mix: 0.07,
    onto: "backgroundColor",
  },
  foregroundColor: "#FFF",
  headerFontSize: 14,
  fontFamily: "inherit",
});

const getTeamLineupForGame = createServerFn({ method: "GET" })
  .validator(zodValidator(z.object({ teamId: z.string(), gameId: z.string() })))
  .handler(async ({ data }) => {
    const bgInfo = await db
      .select({
        batter: batterTable,
        gameInfo: battersGameInfoTable,
        odds: batterOddsTable,
      })
      .from(battersGameInfoTable)
      .innerJoin(batterTable, eq(battersGameInfoTable.batterId, batterTable.id))
      .leftJoin(
        batterOddsTable,
        eq(batterOddsTable.batterGameInfoId, battersGameInfoTable.id),
      )
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

export const BattersTable = ({
  teamId,
  gameId,
}: {
  teamId: string;
  gameId: string;
}) => {
  const { data: teamLineup } = useSuspenseQuery({
    queryKey: ["getTeamLineupForGame", { teamId, gameId }],
    queryFn: () => getTeamLineupForGame({ data: { teamId, gameId } }),
    select: (data) => {
      return data.map((row) => ({
        ...row,
        gameInfo: {
          ...row?.gameInfo,
          battingOrder: row?.gameInfo.battingOrder
            ? row.gameInfo.battingOrder + 1
            : 0,
        },
      }));
    },
  });

  return (
    <div style={{ height: 400, width: "100%" }}>
      <AgGridReact
        theme={myTheme}
        rowData={teamLineup}
        defaultColDef={{ resizable: false, sortable: false }}
        columnDefs={[
          {
            field: "gameInfo.battingOrder",
            headerName: "",
            width: 50,
          },
          { field: "batter.name" },
          { field: "batter.handedness", headerName: "Hand", width: 75 },
          { field: "gameInfo.position", headerName: "Pos.", width: 75 },
        ]}
        detailCellRenderer={BatterIFrame}
        detailCellRendererParams={{ url: "google.com" }}
        masterDetail={true}
      />
    </div>
  );
};
