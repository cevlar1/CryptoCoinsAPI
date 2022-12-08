import * as dotenv from "dotenv";
dotenv.config();

import axios from "axios";

interface arrayType {
  name: string;
  price: number;
}

export const getPricesOnCoinMarketCap = async () => {
  const getConfig = {
    method: "get",
    url: process.env.CoinMarketCapURL,
    headers: {
      "X-CMC_PRO_API_KEY": process.env.CoinMarketCapAuth,
      Accept: "application/json",
      "Accept-Encoding": "identity",
    },
    //responseType: "arraybuffer",
  };

  try {
    let arrayOfCoins: arrayType[] = [];
    const result = await axios(getConfig);
    const resultData = result.data;
    // console.log(resultData);
    for (const elem of resultData["data"]) {
      //console.log(elem);
      arrayOfCoins.push({
        name: elem["symbol"],
        price: elem["quote"]["USD"]["price"],
      });
    }
    return arrayOfCoins;
  } catch (error) {
    console.log(error);
  }
};

// getPricesOnCoinMarketCap().then((result) => console.log(result));
