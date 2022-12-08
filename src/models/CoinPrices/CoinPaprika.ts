import * as dotenv from "dotenv";
dotenv.config();

import axios from "axios";

interface arrayType {
  name: string;
  price: number;
}

export const getPricesOnCoinPaprica = async () => {
  const getConfig = {
    method: "get",
    url: process.env.CoinPaprikaURL,
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
    for (const elem of resultData) {
      //console.log(elem);
      arrayOfCoins.push({
        name: elem["symbol"],
        price: elem["quotes"]["USD"]["price"],
      });
    }

    return arrayOfCoins;
  } catch (error) {
    console.log(error);
  }
};

// getPricesOnCoinPaprica().then((result) => console.log(result));
