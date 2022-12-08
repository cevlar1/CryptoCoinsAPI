import * as dotenv from "dotenv";
dotenv.config();

import axios from "axios";

interface arrayType {
  name: string;
  price: number;
}

export const getPricesOnCoinBase = async () => {
  const getConfig = {
    method: "get",
    url: process.env.CoinBaseURL,
    headers: {
      //"X-CMC_PRO_API_KEY": process.env.CoinMarketCapAuth,
      //  Accept: "application/json",
      "Accept-Encoding": "identity",
    },
    //responseType: "arraybuffer",
  };

  try {
    let arrayOfCoins: arrayType[] = [];
    const result = await axios(getConfig);
    const resultData = result.data;
    // console.log(resultData["data"]["rates"]);
    for (const key in resultData["data"]["rates"]) {
      //console.log(elem);
      arrayOfCoins.push({
        name: key,
        price: 1 / resultData["data"]["rates"][key],
      });
    }
    return arrayOfCoins;
  } catch (error) {
    console.log(error);
  }
};

// getPricesOnCoinBase().then((result) => console.log(result));
