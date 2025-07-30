import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SettingsIcon } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Label } from "./ui/label";

interface OddsFormatStore {
  oddsFormat: "moneyline" | "decimal";
  setOddsFormat: (format: "moneyline" | "decimal") => void;
}

export const useOddsFormat = create<OddsFormatStore>()(
  persist(
    (set) => ({
      oddsFormat: "moneyline",
      setOddsFormat: (fmt) => set({ oddsFormat: fmt }),
    }),
    {
      name: "oddsFormat-storage",
    },
  ),
);

export const OddsFormatToggle = () => {
  const { oddsFormat, setOddsFormat } = useOddsFormat();
  return (
    <Popover>
      <PopoverTrigger>
        <SettingsIcon />
      </PopoverTrigger>
      <PopoverContent side="bottom" align="end">
        <h3 className="mb-2"> Odds Format </h3>
        <RadioGroup
          value={oddsFormat}
          onValueChange={(value) => setOddsFormat(value as any)}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="moneyline" id="moneyline" />
            <Label htmlFor="moneyline">Moneyline</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="decimal" id="decimal" />
            <Label htmlFor="decimal">Decimal</Label>
          </div>
        </RadioGroup>
      </PopoverContent>
    </Popover>
  );
};
