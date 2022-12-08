import cron from "cron";
import { rundb } from "./postgresql";

const CronJob = cron.CronJob;

//console.log("Before job instantiation");
export const job = new CronJob("0 */5 * * * *", async function () {
  const d = new Date();
  await rundb(d);
});
//console.log("job instantiation");
//job.start();
