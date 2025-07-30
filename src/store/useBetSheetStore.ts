import { create } from "zustand";
import { persist } from "zustand/middleware";
import crypto from "crypto";

type Bet = {
  gameInfoId: string;
  type: "oneHit" | "twoHit" | "threeHit";
};

interface BetSheetStore {
  bets: Bet[];
  addBet: (bet: Bet) => void;
  removeBet: (bet: Bet) => void;
  clearBets: () => void;
}

export const useBetSheet = create<BetSheetStore>()(
  persist(
    (set) => ({
      bets: [],
      addBet: (bet) =>
        set((state) => ({
          bets: [
            ...state.bets.filter((b) => b.gameInfoId !== bet.gameInfoId),
            bet,
          ],
        })),
      removeBet: (bet) =>
        set((state) => {
          return {
            bets: state.bets.filter((b) => b.gameInfoId !== bet.gameInfoId),
          };
        }),
      clearBets: (bet) =>
        set((state) => {
          return {
            bets: [],
          };
        }),
    }),
    {
      name: "betSheet-storage",
    },
  ),
);
