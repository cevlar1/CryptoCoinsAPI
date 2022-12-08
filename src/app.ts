import * as dotenv from "dotenv";
dotenv.config();

import express from "express";
import { router } from "./routes/currencySearch";
import { basicInfo } from "./controllers/requestCurrencyPrice";
import { job } from "./models/scheduler";

const app = express();

const PORT = process.env.PORT || 5000;

app.use("/search", router);

app.get("/", basicInfo);

app.listen(PORT, () => {
  job.start();
  console.log(`listening to a port ${PORT}`);
});
