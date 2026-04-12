import { refreshLineups } from "~/server/scrapers";

void refreshLineups().catch((error) => {
  console.error(error);
  process.exit(1);
});
