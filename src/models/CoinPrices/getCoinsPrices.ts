import { getPricesOnCoinBase } from "./CoinBase";
import { getPricesOnCoinMarketCap } from "./CoinMarketCap";
import { getPricesOnCoinPaprica } from "./CoinPaprika";
import { getPricesOnCoinStats } from "./CoinStats";
import { getPricesKuCoin } from "./KuCoin";

export enum CoinMarkets {
  CoinBase,
  CoinMarketCap,
  CoinPaprica,
  CoinStats,
  KuCoin,
}
export const getCoinsPrices = async (CoinMarket: number) => {
  switch (CoinMarket) {
    case CoinMarkets.CoinBase: {
      return await getPricesOnCoinBase();
    }
    case CoinMarkets.CoinMarketCap: {
      return await getPricesOnCoinMarketCap();
    }
    case CoinMarkets.CoinPaprica: {
      return await getPricesOnCoinPaprica();
    }
    case CoinMarkets.CoinStats: {
      return await getPricesOnCoinStats();
    }
    case CoinMarkets.KuCoin: {
      return await getPricesKuCoin();
    }
    default: {
      throw Error("invalid input");
    }
  }
};
