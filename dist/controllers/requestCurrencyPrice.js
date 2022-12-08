"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.basicInfo = exports.requestCurrencyPrice = void 0;
const postgresql_1 = require("../models/postgresql");
const requestCurrencyPrice = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { coin, market, period } = req.query;
    let coinPrices;
    if (typeof coin !== "undefined" && typeof period !== "undefined") {
        let periodInMinutes;
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
            let marketNumber;
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
            coinPrices = (yield (0, postgresql_1.readCoinValue)(coin, periodInMinutes, marketNumber));
            res.send({ coinName: coin, market: market, price: coinPrices });
        }
        else {
            coinPrices = (yield (0, postgresql_1.readCoinValue)(coin, periodInMinutes));
            res.send({ coinName: coin, market: "all", price: coinPrices });
        }
    }
});
exports.requestCurrencyPrice = requestCurrencyPrice;
const basicInfo = (req, res) => {
    res.send(` /search? to get data
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
    `);
};
exports.basicInfo = basicInfo;
