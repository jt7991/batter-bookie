import { useOddsFormat } from "./OddsFormatToggle";

const convertDecToMoneyline = (decimalOdds: number) => {
  if (decimalOdds >= 2) {
    return Math.round((decimalOdds - 1) * 100);
  }
  return Math.round(-100 / (decimalOdds - 1));
};

export const OddsButton = ({ value }: { value?: number | null }) => {
  const { oddsFormat } = useOddsFormat();
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
