import express from "express";
import { requestCurrencyPrice } from "../controllers/requestCurrencyPrice";

export const router = express.Router();

router.get("/", requestCurrencyPrice);

//
