import { refreshLineups } from "./lineups";
import { refreshOdds } from "./odds";

export async function refreshLineupsAndOdds() {
  const lineupResult = await refreshLineups();
  const oddsResult = await refreshOdds();

  return {
    lineupGamesProcessed: lineupResult.gamesProcessed,
    oddsGamesProcessed: oddsResult.gamesProcessed,
    oddsEntriesUpdated: oddsResult.oddsEntriesUpdated,
  };
}

export { refreshLineups, refreshOdds };
