// create a express app that serve / : page.html and /results.json : fetchPlaces

import express from "express";
import { attachStaticServer } from "./server";
import { getCachedResults, initializeCache } from "./datas";
import { discordInit } from "./notif";

const app = express();
const port = process.env.PORT || 3000;

initializeCache();
attachStaticServer(app, getCachedResults);

app.listen(typeof port === "number" ? port : parseInt(port), '0.0.0.0', () => {
    console.log(`[${new Date().toLocaleString("fr-FR")}] Server is running at http://localhost:${port}`);
    discordInit();
});
