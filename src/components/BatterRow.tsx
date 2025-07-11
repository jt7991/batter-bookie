import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
export function BatterRow({
  batter,
  gameInfo,
}: {
  batter: { name: string; handedness: string; url: string };
  gameInfo: { position: string; battingOrder: number };
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
    <div className="p-2  flex flex-col">
      <div className="flex border-b-2 border-slate-400 flex-row justify-between">
        <div className="flex flex-row gap-2">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex flex-row gap-1 text-sm items-center"
          >
            {isCollapsed ? <ChevronDownIcon /> : <ChevronUpIcon />}
          </button>
          <p>{gameInfo.battingOrder + 1}</p>
          <p>
            {batter.name} -{" "}
            <span className="text-zinc-400">{batter.handedness}</span>
          </p>
        </div>
        <p className="text-zinc-400">{gameInfo.position} </p>
      </div>
      {(!isCollapsed || iframeMountedOnce) && (
        <div
          className={`h-96 pt-2 overflow-auto ${isCollapsed ? "hidden" : "visible"}`}
          ref={ref}
        >
          <iframe
            sandbox="allow-scripts"
            src={`https://www.rotowire.com/${batter.url}`}
            height={"50000"}
            className={`pt-2 w-full`}
            onLoad={(e) => {
              const iframe = e.target as HTMLIFrameElement;
              const isMobile = iframe.clientWidth < 780;
              ref.current?.scrollTo(0, isMobile ? 150 : 200);
            }}
          />
        </div>
      )}
    </div>
  );
}
