import { useEffect, useRef } from "react";

export const BatterIFrame = ({ url }: { url: string }) => {
  const ref = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    ref.current.onload = () => {
      // Access the iframe's content window and scroll it
      ref.current?.contentWindow?.scrollTo(0, 200);
      const scrollElem = ref.current?.contentWindow?.document
        .getElementsByClassName("p-card__player-row")[0]
        ?.scrollIntoView();
      console.log("scrolling");
    };
  }, [ref.current]);
  window.iframe = ref.current;

  return <iframe src={url} height={"500"} className="pt-2" ref={ref} />;
};
