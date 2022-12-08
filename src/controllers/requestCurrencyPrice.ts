import { RequestHandler } from "express";
import { readCoinValue, outData } from "../models/postgresql";

export const requestCurrencyPrice: RequestHandler = async (req, res) => {
  const { coin, market, period } = req.query;
  let coinPrices: outData[] | null;

  if (typeof coin !== "undefined" && typeof period !== "undefined") {
    let periodInMinutes: number;
    switch (period) {
      case "24h":
        periodInMinutes = 24 * 60;
        break;
      case "4h":
        periodInMinutes = 4 * 60;
        break;
      case "1h":
        periodInMinutes = 60;
        break;
      case "15m":
        periodInMinutes = 15;
        break;
      default:
        res.status(500).send("wrong period data");
        return;
    }
    if (typeof market !== "undefined") {
      let marketNumber: number;
      switch (market) {
        case "CoinMarketCap":
          marketNumber = 0;
          break;
        case "CoinBase":
          marketNumber = 1;
          break;
        case "CoinPaprika":
          marketNumber = 3;
          break;
        case "KuCoin":
          marketNumber = 4;
          break;
        default:
          res.status(500).send("wrong market name");
          return;
      }

      coinPrices = (await readCoinValue(
        <string>coin,
        periodInMinutes,
        marketNumber
      )) as outData[] | null;
      res.send({ coinName: coin, market: market, price: coinPrices });
    } else {
      coinPrices = (await readCoinValue(<string>coin, periodInMinutes)) as
        | outData[]
        | null;
      res.send({ coinName: coin, market: "all", price: coinPrices });
    }
  }
};

export const basicInfo: RequestHandler = (req, res) => {
  res.send(
    ` /search? to get data
    coin= to set coin name
    market= to set market name
      - CoinMarketCap
      - CoinBase
      - CoinPaprika
      - KuCoin
    period= to set period
      - 15m
      - 1h
      - 4h
      - 24h
    `
  );
};
