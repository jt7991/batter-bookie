import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { OddsButton } from "./OddsButton";

export function BatterRow({
  batter,
  gameInfo,
  odds,
}: {
  batter: { name: string; handedness: string; url: string };
  gameInfo: { position: string; battingOrder: number };
  odds: {
    oneHitOdds: string | null;
    twoHitOdds: string | null;
    threeHitOdds: string | null;
  } | null;
}) {
  const [iframeMountedOnce, setIframeMountedOnce] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isCollapsed && !iframeMountedOnce) {
      setIframeMountedOnce(true);
    }
  }, [isCollapsed]);

  return (
    <>
      <tr>
        <td className="w-24 border-b-2 border-slate-400">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="flex flex-row gap-1 text-sm items-center"
            >
              {isCollapsed ? <ChevronDownIcon /> : <ChevronUpIcon />}
            </button>
            {gameInfo.battingOrder + 1}
          </div>
        </td>
        <td className="border-b-2 border-slate-400">{batter.name}</td>
        <td className="w-10 border-b-2 border-slate-400">{batter.handedness}</td>
        <td className="w-12 border-b-2 border-slate-400">{gameInfo.position}</td>
        <td className="border-b-2 border-slate-400">
          <OddsButton value={odds?.oneHitOdds} />
        </td>
        <td className="border-b-2 border-slate-400">
          <OddsButton value={odds?.twoHitOdds} />
        </td>
        <td className="border-b-2 border-slate-400">
          <OddsButton value={odds?.threeHitOdds} />
        </td>
      </tr>
      {(!isCollapsed || iframeMountedOnce) && (
        <tr className={isCollapsed ? "hidden" : "visible"}>
          <td className="w-full" colSpan={7}>
            <div className="h-96 pt-2 overflow-auto" ref={ref}>
              <iframe
                sandbox="allow-scripts"
                src={`https://www.rotowire.com/${batter.url}`}
                height={"50000"}
                className="pt-2 w-full"
                onLoad={(e) => {
                  const iframe = e.target as HTMLIFrameElement;
                  const isMobile = iframe.clientWidth < 780;
                  ref.current?.scrollTo(0, isMobile ? 150 : 200);
                }}
              />
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
