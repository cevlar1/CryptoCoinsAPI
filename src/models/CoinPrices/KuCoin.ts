import * as dotenv from "dotenv";
dotenv.config();

import axios from "axios";

interface arrayType {
  name: string;
  price: number;
}

export const getPricesKuCoin = async () => {
  const getConfig = {
    method: "get",
    url: process.env.KuCoinURL,
    headers: {
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
    for (const elem of resultData["data"]["ticker"]) {
      //console.log(elem);
      arrayOfCoins.push({
        name: elem["symbol"],
        price: elem["last"],
      });
    }

    arrayOfCoins = arrayOfCoins.filter((elem: arrayType) =>
      elem["name"].includes("USDT")
    );
    arrayOfCoins.forEach(
      (elem) => (elem.name = elem.name.replace("-USDT", ""))
    );

    return arrayOfCoins;
  } catch (error) {
    console.log(error);
  }
};

// console.log("XMR-ETH".includes("USDT"));
// console.log("LTC3S-USDT".includes("USDT"));

// getPricesOnCoinMarketCap().then((result) => console.log(result));
