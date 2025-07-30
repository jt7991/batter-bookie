import { getValueString } from "./OddsButton";
import { useOddsFormat } from "./OddsFormatToggle";

export const OddsDisplay = ({ value }: { value: number }) => {
  const { oddsFormat } = useOddsFormat();

  return getValueString(value, oddsFormat);
};
