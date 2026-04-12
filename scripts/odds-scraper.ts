import { refreshOdds } from "~/server/scrapers";

void refreshOdds().catch((error) => {
  console.error(error);
  process.exit(1);
});
