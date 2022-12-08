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
exports.getCoinsPrices = exports.CoinMarkets = void 0;
const CoinBase_1 = require("./CoinBase");
const CoinMarketCap_1 = require("./CoinMarketCap");
const CoinPaprika_1 = require("./CoinPaprika");
const CoinStats_1 = require("./CoinStats");
const KuCoin_1 = require("./KuCoin");
var CoinMarkets;
(function (CoinMarkets) {
    CoinMarkets[CoinMarkets["CoinBase"] = 0] = "CoinBase";
    CoinMarkets[CoinMarkets["CoinMarketCap"] = 1] = "CoinMarketCap";
    CoinMarkets[CoinMarkets["CoinPaprica"] = 2] = "CoinPaprica";
    CoinMarkets[CoinMarkets["CoinStats"] = 3] = "CoinStats";
    CoinMarkets[CoinMarkets["KuCoin"] = 4] = "KuCoin";
})(CoinMarkets = exports.CoinMarkets || (exports.CoinMarkets = {}));
const getCoinsPrices = (CoinMarket) => __awaiter(void 0, void 0, void 0, function* () {
    switch (CoinMarket) {
        case CoinMarkets.CoinBase: {
            return yield (0, CoinBase_1.getPricesOnCoinBase)();
        }
        case CoinMarkets.CoinMarketCap: {
            return yield (0, CoinMarketCap_1.getPricesOnCoinMarketCap)();
        }
        case CoinMarkets.CoinPaprica: {
            return yield (0, CoinPaprika_1.getPricesOnCoinPaprica)();
        }
        case CoinMarkets.CoinStats: {
            return yield (0, CoinStats_1.getPricesOnCoinStats)();
        }
        case CoinMarkets.KuCoin: {
            return yield (0, KuCoin_1.getPricesKuCoin)();
        }
        default: {
            throw Error("invalid input");
        }
    }
});
exports.getCoinsPrices = getCoinsPrices;
