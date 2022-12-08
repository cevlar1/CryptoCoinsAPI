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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPricesKuCoin = void 0;
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const axios_1 = __importDefault(require("axios"));
const getPricesKuCoin = () => __awaiter(void 0, void 0, void 0, function* () {
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
        let arrayOfCoins = [];
        const result = yield (0, axios_1.default)(getConfig);
        const resultData = result.data;
        // console.log(resultData);
        for (const elem of resultData["data"]["ticker"]) {
            //console.log(elem);
            arrayOfCoins.push({
                name: elem["symbol"],
                price: elem["last"],
            });
        }
        arrayOfCoins = arrayOfCoins.filter((elem) => elem["name"].includes("USDT"));
        arrayOfCoins.forEach((elem) => (elem.name = elem.name.replace("-USDT", "")));
        return arrayOfCoins;
    }
    catch (error) {
        console.log(error);
    }
});
exports.getPricesKuCoin = getPricesKuCoin;
// console.log("XMR-ETH".includes("USDT"));
// console.log("LTC3S-USDT".includes("USDT"));
// getPricesOnCoinMarketCap().then((result) => console.log(result));
