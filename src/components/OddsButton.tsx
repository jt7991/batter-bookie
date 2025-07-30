import { useBetSheet } from "~/store/useBetSheetStore";
import { useOddsFormat } from "./OddsFormatToggle";
import { Button } from "./ui/button";

export const convertDecToMoneyline = (decimalOdds: number) => {
  if (decimalOdds >= 2) {
    return Math.round((decimalOdds - 1) * 100);
  }
  return Math.round(-100 / (decimalOdds - 1));
};

export const getValueString = (value: number | null, oddsFormat: string) => {
  if (!value) return "??";

  if (oddsFormat === "decimal") {
    return value;
  }
  const moneylineValue = convertDecToMoneyline(value);
  if (moneylineValue > 100) {
    return `+${moneylineValue}`;
  }
  return moneylineValue;
};

export const OddsButton = ({
  value,
  gameInfoId,
  type,
}: {
  value?: number | null;
  gameInfoId: string;
  type: "oneHit" | "twoHit" | "threeHit";
}) => {
  const { oddsFormat } = useOddsFormat();
  const { addBet, removeBet, bets } = useBetSheet();

  const isSelected = bets.some(
    (bet) => bet.gameInfoId === gameInfoId && type === bet.type,
  );

  return (
    <Button
      className="w-12 cursor-pointer"
      variant={isSelected ? "secondary" : "outline"}
      onClick={() => {
        if (isSelected) {
          return removeBet({ gameInfoId, type });
        }
        return addBet({ gameInfoId, type });
      }}
    >
      {getValueString(value || 0, oddsFormat)}
    </Button>
  );
};
