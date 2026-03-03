
import express from "express";
import { getData } from "../handlers/dataHandler.js";


const router = express.Router();

router.get("/data", getData);

export default router;