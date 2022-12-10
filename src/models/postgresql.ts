import * as dotenv from "dotenv";
dotenv.config();
import { Client } from "pg";
import { getCoinsPrices } from "./CoinPrices/getCoinsPrices";

const dbConnectionData = {
  host: process.env.dbhost,
  user: process.env.dbuser,
  password: process.env.dbpassword,
  port: Number(process.env.dbport),
};

const dbConnectionTableData = {
  ...dbConnectionData,
  ...{ database: <string>process.env.dbname!.toLowerCase() },
};

const tablesNames = [
  process.env.dbtable0,
  process.env.dbtable1,
  process.env.dbtable2,
  process.env.dbtable3,
  process.env.dbtable4,
];

export interface outData {
  date: string;
  price: number;
}
// console.log(dbConnectionTableData);

export const rundb = async (date: Date) => {
  // if (!(await checkDatabaseExistence())) {
  //   await createDatabase();
  // }

  for (let i = 0; i < tablesNames.length; i++) {
    if (i != 2) {
      if (!(await checkTableExistence(i))) {
        await createTable(i);
      }
      await addRowTable(i, date);
    }
  }
};

const getPriceInCertainMarketAndPeriod = async (
  client: Client,
  coinName: string,
  timePeriod: number,
  marketNumber: number
) => {
  let data: outData[] = [];

  const res = await client.query(`select column_name
  from information_schema.columns
  where table_name = '${tablesNames[marketNumber]?.toLowerCase()}'`);

  const arrayOfColumns = res.rows.map((obj) => obj["column_name"]);

  if (arrayOfColumns.includes(coinName)) {
    const columnPrices = await client.query(
      `SELECT ${coinName} FROM ${tablesNames[marketNumber]?.toLowerCase()}`
    );
    const columnDate = await client.query(
      `SELECT date FROM ${tablesNames[marketNumber]?.toLowerCase()}`
    );

    const arrayofCoinPrices: number[] = columnPrices.rows.map(
      (elem) => elem[coinName]
    );
    const arrayofDates = columnDate.rows.map((elem) => {
      return new Date(+elem["date"]);
      // d.getDate()  + "-" + (d.getMonth()+1) + "-" + d.getFullYear() + " " +
      // d.getHours() + ":" + d.getMinutes();
    });

    let showResultsUpToDate = new Date(Date.now() - 1000 * 60 * timePeriod);

    let arrayOfPricesDates = arrayofCoinPrices.map((elem, ind) => {
      return { date: arrayofDates[ind], price: elem };
    });

    arrayOfPricesDates = arrayOfPricesDates.filter(
      (elem) => elem["date"].getTime() - showResultsUpToDate.getTime() > 0
    );

    data = arrayOfPricesDates.map((elem) => {
      let d = elem.date;
      let dateString =
        d.getDate() +
        "-" +
        (d.getMonth() + 1) +
        "-" +
        d.getFullYear() +
        " " +
        d.getHours() +
        ":" +
        d.getMinutes();
      //      return { date: dateString, price: +elem["price"] };
      return { date: elem["date"].getTime().toString(), price: +elem["price"] };
    });
    return data;
  } else return null;
};

const getAveragePriceInCertainPeriod = async (
  client: Client,
  coinName: string,
  timePeriod: number
) => {
  let arrayOfData: outData[][] = [];
  for (let i = 0; i < 5; i++) {
    if (i !== 2) {
      const priceOfOneCoin = await getPriceInCertainMarketAndPeriod(
        client,
        coinName,
        timePeriod,
        i
      );

      if (priceOfOneCoin != null) {
        arrayOfData.push(priceOfOneCoin);
      }
    }
  }
  if (arrayOfData.length != 0) {
    let outRes = arrayOfData[0];
    for (let k = 1; k < arrayOfData.length; k++) {
      outRes = outRes?.map((elem, index) => {
        return {
          date: elem.date,
          price:
            +elem.price * (k / (k + 1)) +
            +arrayOfData[k][index].price * (1 / (k + 1)),
        };
      });
    }
    return outRes;
  } else return null;
};

export const readCoinValue = async (
  coinName: string,
  timePeriod: number,
  marketNumber = -1
) => {
  const client = new Client(dbConnectionTableData);
  try {
    await client.connect();
    let data: outData[] | null;

    if (marketNumber == -1) {
      data = await getAveragePriceInCertainPeriod(client, coinName, timePeriod);
    } else
      data = await getPriceInCertainMarketAndPeriod(
        client,
        coinName,
        timePeriod,
        marketNumber
      );

    //console.log(data);
    return data;

    // if market is not stated then
    // check if coin exists in given market
    //
  } catch (error) {
    console.log(error);
  } finally {
    client.end();
  }
};

const checkDatabaseExistence = async () => {
  const client = new Client(dbConnectionData);

  try {
    if (process.env.dbname === undefined) {
      throw Error("no database name");
    }
    await client.connect(); // gets connection

    const result = await client.query("SELECT datname FROM pg_database;"); // sends queries
    const ind = result.rows.findIndex(
      (elem) => elem.datname === process.env.dbname!.toLowerCase()
    );

    if (ind == -1) {
      console.log("database does not exist");
      return false;
    } else {
      console.log("database exists");
      return true;
    }
  } catch (error) {
    console.error(error);
    return false;
  } finally {
    client.end();
  }
};

const createDatabase = async () => {
  const client = new Client(dbConnectionData);

  try {
    const createDatabase = `
      CREATE DATABASE ${process.env.dbname}
    `;

    await client.connect(); // gets connection

    await client.query(createDatabase); // sends queries
    console.log("database created");

    return true;
  } catch (error) {
    console.error(error);
    return false;
  } finally {
    client.end();
  }
};

const checkTableExistence = async (tableNumber: number) => {
  const client = new Client(dbConnectionTableData);

  try {
    await client.connect(); // gets connection
    const result = await client.query(`SELECT * FROM pg_catalog.pg_tables;`); // sends queries
    //console.log(result);
    const ind = result["rows"].findIndex(
      (elem) => elem.tablename === tablesNames[tableNumber]?.toLowerCase()
    );
    if (ind == -1) {
      console.log("table does not exist");
      return false;
    } else {
      console.log("table exists");
      return true;
    }
  } catch (error) {
    console.error(error);
    return false;
  } finally {
    client.end();
  }
};

const createTable = async (tableNumber: number) => {
  const client = new Client(dbConnectionTableData);

  const createTableStart = `
    CREATE TABLE ${tablesNames[tableNumber]} (
	    "id" SERIAL,
	    "date" VARCHAR(255), \n`;

  const createTableEnd = `PRIMARY KEY ("id")
  );`;

  let createTableMiddle = "";
  try {
    const coinList = await getCoinsPrices(tableNumber);
    if (coinList !== undefined) {
      coinList.forEach(
        (elem) =>
          (createTableMiddle += `"${elem.name.toLowerCase()}" VARCHAR(255), \n`)
      );
    } else {
      throw Error("Unsuccesful url parse");
    }

    const createTable = createTableStart + createTableMiddle + createTableEnd;
    //console.log(createTable);

    await client.connect(); // gets connection
    await client.query(createTable); // sends queries

    console.log("table created");

    return true;
  } catch (error) {
    console.error(error);
    return false;
  } finally {
    client.end();
  }
};

const addRowTable = async (tableNumber: number, date1: Date) => {
  const client = new Client(dbConnectionTableData);
  try {
    const coinList = await getCoinsPrices(tableNumber);
    const arrayOfKeys = coinList?.map((elem) => elem.name);
    const arrayOfValues = coinList?.map((elem) => elem.price);
    const arrayOfKeysLC = arrayOfKeys?.map((elem) => elem.toLowerCase());
    let columnNames = "";
    let rowData = "";
    if (typeof arrayOfKeysLC !== "undefined") {
      columnNames = '"date", "' + arrayOfKeysLC.join('", "') + '"';
    }
    // console.log(columnNames);
    let addRowTable = "";

    if (typeof arrayOfValues !== "undefined") {
      rowData =
        '"' +
        date1.getTime().toString() +
        '", "' +
        arrayOfValues.join('", "') +
        '"';

      //const addRowTable = `INSERT INTO ${tablesNames[tableNumber]} (${columnNames}) VALUES (${rowData})`;
      addRowTable = `INSERT INTO ${
        tablesNames[tableNumber]
      } (${columnNames}) VALUES ($${Array.from(
        { length: arrayOfValues?.length + 1 },
        (_, i) => i + 1
      ).join(", $")})`;
    }
    //console.log(addRowTable);

    await client.connect(); // gets connection

    await addColumnsIfNotExisted(
      client,
      tablesNames[tableNumber]!,
      arrayOfKeysLC!
    );

    await client.query(addRowTable, [
      date1.getTime().toString(),
      ...arrayOfValues!,
    ]); // sends queries

    console.log("row added");

    return true;
  } catch (error) {
    console.error(error);
    return false;
  } finally {
    client.end();
  }
};

const addColumnsIfNotExisted = async (
  client: Client,
  tableName: string,
  columnsFromAPI: string[]
) => {
  const res = await client.query(`select column_name
  from information_schema.columns
  where table_name = '${tableName?.toLowerCase()}'`);
  const arrayOfColumns = res.rows.map((obj) => obj["column_name"]);
  const columnsToAdd = columnsFromAPI.filter(
    (elem) => !arrayOfColumns?.includes(elem)
  );
  // console.log(columnsFromAPI);
  // console.log(res.rows);
  // console.log(columnsToAdd);

  await columnsToAdd.forEach(async (elem) => {
    await client.query(`ALTER TABLE ${tableName} 
    ADD "${elem}" VARCHAR(255); `);
  });
  // await client.query(`select column_name
  // from information_schema.columns
  // where table_name = '${tableName?.toLowerCase()}'`);
};
// createConnectDatabase().then(() => createTable());
//createTable();

// let d = new Date();
// rundb(d);

//readCoinValue("btc", 160, 4);
