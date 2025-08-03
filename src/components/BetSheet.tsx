import { createServerFn } from "@tanstack/react-start";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";
import { useBetSheet } from "~/store/useBetSheetStore";
import { batterOddsTable, battersGameInfoTable } from "~/server/db/schema";
import { db } from "~/server/db";
import { eq } from "drizzle-orm";
import { zodValidator } from "@tanstack/zod-adapter";
import { useQueries } from "@tanstack/react-query";
import z from "zod";
import { ChevronUp } from "lucide-react";
import { OddsDisplay } from "./OddsDisplay";
import { Button } from "./ui/button";
import { Label } from "@radix-ui/react-label";
import { Input } from "./ui/input";
import { useState } from "react";

const getOddsByGameInfoId = createServerFn({ method: "GET" })
  .validator(zodValidator(z.object({ gameInfoId: z.string() })))
  .handler(async ({ data }) => {
    const odds = await db.query.batterOddsTable.findFirst({
      where: eq(batterOddsTable.batterGameInfoId, data.gameInfoId),
    });
    const info = await db.query.battersGameInfoTable.findFirst({
      with: { batter: true },
      where: eq(battersGameInfoTable.id, data.gameInfoId),
    });
    return { odds, batter: info?.batter };
  });

const getOddsTypeText = (type: "oneHit" | "twoHit" | "threeHit") => {
  if (type === "oneHit") {
    return "1+ Hits";
  }

  if (type === "twoHit") {
    return "2+ Hits";
  }

  return "3+ Hits";
};

export function BetSheet() {
  const { bets, clearBets } = useBetSheet();
  const [betAmount, setBetAmount] = useState<number>(0);
  const hasBets = bets.length > 0;
  const oddsQuery = useQueries({
    queries: bets.map((bet) => {
      return {
        queryKey: ["getOddsByGameInfoId", bet.gameInfoId],
        queryFn: () =>
          getOddsByGameInfoId({ data: { gameInfoId: bet.gameInfoId } }),
      };
    }),
    combine: (results) => {
      return {
        isLoading: results.some((res) => res.isLoading),
        data: results.map((res, index) => {
          const type = bets[index].type;
          const odds =
            type === "oneHit"
              ? res.data?.odds?.oneHitOdds
              : type === "twoHit"
                ? res.data?.odds?.twoHitOdds
                : res.data?.odds?.threeHitOdds;
          return {
            type: bets[index].type,
            odds: odds ?? null,
            name: res.data?.batter?.name,
          };
        }),
      };
    },
  });

  const parlayOdds = oddsQuery.data.reduce((acc, bet) => {
    return acc * Number(bet.odds);
  }, 1);
  return (
    <Drawer>
      <DrawerTrigger asChild>
        {hasBets ? (
          <div className="w-full h-14 text-bold bg-slate-900 text-white flex items-center justify-between px-4 fixed bottom-0 rounded-t-lg">
            <p>Parlay: {bets.length} legs</p>
            <div className="flex flex-row gap-2">
              <OddsDisplay value={parlayOdds} />
              <ChevronUp />
            </div>
          </div>
        ) : (
          <div />
        )}
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Parlay</DrawerTitle>
          <DrawerClose asChild>
            <Button
              onClick={clearBets}
              className="w-fit self-end"
              variant="destructive"
            >
              Clear
            </Button>
          </DrawerClose>
        </DrawerHeader>
        <div className="p-4 flex flex-col">
          <div className="grid grid-cols-12 w-full font-semibold text-sm text-slate-500 px-2">
            <p className="col-span-5">Player</p>
            <p className="col-span-5">Bet</p>
            <p className="col-span-2 text-right">Odds</p>
          </div>
          <ul className="mt-2 border-b border-slate-800">
            {oddsQuery.data.map((bet, index) => (
              <li
                key={`${bet.name}-${bet.type}-${index}`}
                className="grid grid-cols-12 w-full py-3 border-b border-slate-800 last:border-b-0 px-2 items-center"
              >
                <p className="col-span-5 truncate font-medium">{bet.name}</p>
                <p className="col-span-5 text-slate-400">
                  {getOddsTypeText(bet.type)}
                </p>
                <p className="col-span-2 text-right">
                  <OddsDisplay value={Number(bet.odds)} />
                </p>
              </li>
            ))}
          </ul>
          <div className="grid grid-cols-12 w-1/2 self-end pt-4 gap-4">
            <p className="text-slate-400 col-span-6 ">Total</p>
            <p className="col-span-6 text-end pr-2">
              <OddsDisplay value={parlayOdds} />
            </p>
            <Label className="text-slate-400 col-span-6 ">Bet</Label>
            <div className="col-span-6 w-full items-center gap-2 flex flex-row justify-end">
              $
              <Input
                className="w-16 text-right"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.valueAsNumber)}
                type="number"
              />
            </div>
            <p className="text-slate-400 col-span-6 ">Win</p>
            <p className="col-span-6 text-end pr-2">
              {(parlayOdds * betAmount).toFixed(2) || "??"}
            </p>
          </div>
        </div>
        <DrawerFooter>
          <DrawerClose>Close</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
