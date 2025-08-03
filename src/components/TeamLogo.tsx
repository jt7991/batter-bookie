import React from "react";
import * as logos from "./logos";

const logoMap: { [key: string]: React.ComponentType<any> } = {
  ARI: logos.ARI,
  ATL: logos.ATL,
  BAL: logos.BAL,
  BOS: logos.BOS,
  CHC: logos.CHC,
  CWS: logos.CHW,
  CIN: logos.CIN,
  CLE: logos.CLE,
  COL: logos.COL,
  DET: logos.DET,
  HOU: logos.HOU,
  KC: logos.KAN,
  LAA: logos.LAA,
  LAD: logos.LAD,
  MIA: logos.MIA,
  MIL: logos.MIL,
  MIN: logos.MIN,
  MLB: logos.MLB,
  NYM: logos.NYM,
  NYY: logos.NYY,
  OAK: logos.OAK,
  PHI: logos.PHI,
  PIT: logos.PIT,
  SD: logos.SD,
  SEA: logos.SEA,
  SF: logos.SF,
  STL: logos.STL,
  TB: logos.TB,
  TEX: logos.TEX,
  TOR: logos.TOR,
  WSH: logos.WAS,
};

const TeamLogo = ({ teamId, size = 48 }: { teamId: string; size?: number }) => {
  const LogoComponent = logoMap[teamId.toUpperCase()];

  if (!LogoComponent) {
    return null;
  }

  return (
    <LogoComponent
      size={size}
      style={{
        filter: "drop-shadow(0px 0px 1px #fff)",
      }}
    />
  );
};

export default TeamLogo;
