"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.readCoinValue = exports.rundb = void 0;
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const pg_1 = require("pg");
const getCoinsPrices_1 = require("./CoinPrices/getCoinsPrices");
const dbConnectionData = {
    host: process.env.dbhost,
    user: process.env.dbuser,
    password: process.env.dbpassword,
    port: Number(process.env.dbport),
};
const dbConnectionTableData = Object.assign(Object.assign({}, dbConnectionData), { database: process.env.dbname.toLowerCase() });
const tablesNames = [
    process.env.dbtable0,
    process.env.dbtable1,
    process.env.dbtable2,
    process.env.dbtable3,
    process.env.dbtable4,
];
// console.log(dbConnectionTableData);
const rundb = (date) => __awaiter(void 0, void 0, void 0, function* () {
    if (!(yield checkDatabaseExistence())) {
        yield createDatabase();
    }
    for (let i = 0; i < tablesNames.length; i++) {
        if (i != 2) {
            if (!(yield checkTableExistence(i))) {
                yield createTable(i);
            }
            yield addRowTable(i, date);
        }
    }
});
exports.rundb = rundb;
const getPriceInCertainMarketAndPeriod = (client, coinName, timePeriod, marketNumber) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    let data = [];
    const res = yield client.query(`select column_name
  from information_schema.columns
  where table_name = '${(_a = tablesNames[marketNumber]) === null || _a === void 0 ? void 0 : _a.toLowerCase()}'`);
    const arrayOfColumns = res.rows.map((obj) => obj["column_name"]);
    if (arrayOfColumns.includes(coinName)) {
        const columnPrices = yield client.query(`SELECT ${coinName} FROM ${(_b = tablesNames[marketNumber]) === null || _b === void 0 ? void 0 : _b.toLowerCase()}`);
        const columnDate = yield client.query(`SELECT date FROM ${(_c = tablesNames[marketNumber]) === null || _c === void 0 ? void 0 : _c.toLowerCase()}`);
        const arrayofCoinPrices = columnPrices.rows.map((elem) => elem[coinName]);
        const arrayofDates = columnDate.rows.map((elem) => {
            return new Date(+elem["date"]);
            // d.getDate()  + "-" + (d.getMonth()+1) + "-" + d.getFullYear() + " " +
            // d.getHours() + ":" + d.getMinutes();
        });
        let showResultsUpToDate = new Date(Date.now() - 1000 * 60 * timePeriod);
        let arrayOfPricesDates = arrayofCoinPrices.map((elem, ind) => {
            return { date: arrayofDates[ind], price: elem };
        });
        arrayOfPricesDates = arrayOfPricesDates.filter((elem) => elem["date"].getTime() - showResultsUpToDate.getTime() > 0);
        data = arrayOfPricesDates.map((elem) => {
            let d = elem.date;
            let dateString = d.getDate() +
                "-" +
                (d.getMonth() + 1) +
                "-" +
                d.getFullYear() +
                " " +
                d.getHours() +
                ":" +
                d.getMinutes();
            return { date: dateString, price: +elem["price"] };
        });
        return data;
    }
    else
        return null;
});
const getAveragePriceInCertainPeriod = (client, coinName, timePeriod) => __awaiter(void 0, void 0, void 0, function* () {
    let arrayOfData = [];
    for (let i = 0; i < 5; i++) {
        if (i !== 2) {
            const priceOfOneCoin = yield getPriceInCertainMarketAndPeriod(client, coinName, timePeriod, i);
            if (priceOfOneCoin != null) {
                arrayOfData.push(priceOfOneCoin);
            }
        }
    }
    if (arrayOfData.length != 0) {
        let outRes = arrayOfData[0];
        for (let k = 1; k < arrayOfData.length; k++) {
            outRes = outRes === null || outRes === void 0 ? void 0 : outRes.map((elem, index) => {
                return {
                    date: elem.date,
                    price: +elem.price * (k / (k + 1)) +
                        +arrayOfData[k][index].price * (1 / (k + 1)),
                };
            });
        }
        return outRes;
    }
    else
        return null;
});
const readCoinValue = (coinName, timePeriod, marketNumber = -1) => __awaiter(void 0, void 0, void 0, function* () {
    const client = new pg_1.Client(dbConnectionTableData);
    try {
        yield client.connect();
        let data;
        if (marketNumber == -1) {
            data = yield getAveragePriceInCertainPeriod(client, coinName, timePeriod);
        }
        else
            data = yield getPriceInCertainMarketAndPeriod(client, coinName, timePeriod, marketNumber);
        //console.log(data);
        return data;
        // if market is not stated then
        // check if coin exists in given market
        //
    }
    catch (error) {
        console.log(error);
    }
    finally {
        client.end();
    }
});
exports.readCoinValue = readCoinValue;
const checkDatabaseExistence = () => __awaiter(void 0, void 0, void 0, function* () {
    const client = new pg_1.Client(dbConnectionData);
    try {
        if (process.env.dbname === undefined) {
            throw Error("no database name");
        }
        yield client.connect(); // gets connection
        const result = yield client.query("SELECT datname FROM pg_database;"); // sends queries
        const ind = result.rows.findIndex((elem) => elem.datname === process.env.dbname.toLowerCase());
        if (ind == -1) {
            console.log("database does not exist");
            return false;
        }
        else {
            console.log("database exists");
            return true;
        }
    }
    catch (error) {
        console.error(error);
        return false;
    }
    finally {
        client.end();
    }
});
const createDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    const client = new pg_1.Client(dbConnectionData);
    try {
        const createDatabase = `
      CREATE DATABASE ${process.env.dbname}
    `;
        yield client.connect(); // gets connection
        yield client.query(createDatabase); // sends queries
        console.log("database created");
        return true;
    }
    catch (error) {
        console.error(error);
        return false;
    }
    finally {
        client.end();
    }
});
const checkTableExistence = (tableNumber) => __awaiter(void 0, void 0, void 0, function* () {
    const client = new pg_1.Client(dbConnectionTableData);
    try {
        yield client.connect(); // gets connection
        const result = yield client.query(`SELECT * FROM pg_catalog.pg_tables;`); // sends queries
        //console.log(result);
        const ind = result["rows"].findIndex((elem) => { var _a; return elem.tablename === ((_a = tablesNames[tableNumber]) === null || _a === void 0 ? void 0 : _a.toLowerCase()); });
        if (ind == -1) {
            console.log("table does not exist");
            return false;
        }
        else {
            console.log("table exists");
            return true;
        }
    }
    catch (error) {
        console.error(error);
        return false;
    }
    finally {
        client.end();
    }
});
const createTable = (tableNumber) => __awaiter(void 0, void 0, void 0, function* () {
    const client = new pg_1.Client(dbConnectionTableData);
    const createTableStart = `
    CREATE TABLE ${tablesNames[tableNumber]} (
	    "id" SERIAL,
	    "date" VARCHAR(255), \n`;
    const createTableEnd = `PRIMARY KEY ("id")
  );`;
    let createTableMiddle = "";
    try {
        const coinList = yield (0, getCoinsPrices_1.getCoinsPrices)(tableNumber);
        if (coinList !== undefined) {
            coinList.forEach((elem) => (createTableMiddle += `"${elem.name.toLowerCase()}" VARCHAR(255), \n`));
        }
        else {
            throw Error("Unsuccesful url parse");
        }
        const createTable = createTableStart + createTableMiddle + createTableEnd;
        //console.log(createTable);
        yield client.connect(); // gets connection
        yield client.query(createTable); // sends queries
        console.log("table created");
        return true;
    }
    catch (error) {
        console.error(error);
        return false;
    }
    finally {
        client.end();
    }
});
const addRowTable = (tableNumber, date1) => __awaiter(void 0, void 0, void 0, function* () {
    const client = new pg_1.Client(dbConnectionTableData);
    try {
        const coinList = yield (0, getCoinsPrices_1.getCoinsPrices)(tableNumber);
        const arrayOfKeys = coinList === null || coinList === void 0 ? void 0 : coinList.map((elem) => elem.name);
        const arrayOfValues = coinList === null || coinList === void 0 ? void 0 : coinList.map((elem) => elem.price);
        const arrayOfKeysLC = arrayOfKeys === null || arrayOfKeys === void 0 ? void 0 : arrayOfKeys.map((elem) => elem.toLowerCase());
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
            addRowTable = `INSERT INTO ${tablesNames[tableNumber]} (${columnNames}) VALUES ($${Array.from({ length: (arrayOfValues === null || arrayOfValues === void 0 ? void 0 : arrayOfValues.length) + 1 }, (_, i) => i + 1).join(", $")})`;
        }
        //console.log(addRowTable);
        yield client.connect(); // gets connection
        yield addColumnsIfNotExisted(client, tablesNames[tableNumber], arrayOfKeysLC);
        yield client.query(addRowTable, [
            date1.getTime().toString(),
            ...arrayOfValues,
        ]); // sends queries
        console.log("row added");
        return true;
    }
    catch (error) {
        console.error(error);
        return false;
    }
    finally {
        client.end();
    }
});
const addColumnsIfNotExisted = (client, tableName, columnsFromAPI) => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield client.query(`select column_name
  from information_schema.columns
  where table_name = '${tableName === null || tableName === void 0 ? void 0 : tableName.toLowerCase()}'`);
    const arrayOfColumns = res.rows.map((obj) => obj["column_name"]);
    const columnsToAdd = columnsFromAPI.filter((elem) => !(arrayOfColumns === null || arrayOfColumns === void 0 ? void 0 : arrayOfColumns.includes(elem)));
    // console.log(columnsFromAPI);
    // console.log(res.rows);
    // console.log(columnsToAdd);
    yield columnsToAdd.forEach((elem) => __awaiter(void 0, void 0, void 0, function* () {
        yield client.query(`ALTER TABLE ${tableName} 
    ADD "${elem}" VARCHAR(255); `);
    }));
    // await client.query(`select column_name
    // from information_schema.columns
    // where table_name = '${tableName?.toLowerCase()}'`);
});
// createConnectDatabase().then(() => createTable());
//createTable();
// let d = new Date();
// rundb(d);
//readCoinValue("btc", 160, 4);
