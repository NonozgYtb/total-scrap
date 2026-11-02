// create a express app that serve / : page.html and /results.json : fetchPlaces

const express = require("express");
const path = require("path");
const { fetchPlaces, config } = require("./index.js");
const fsPromises = require("fs/promises");

const app = express();
const port = 3000;

const cachedFunction = (fn, cacheDuration) => {
    let cache = null;
    let lastFetchTime = 0;

    return async (...args) => {
        const now = Date.now();
        if (cache && now - lastFetchTime < cacheDuration) {
            return cache;
        }
        cache = await fn(...args);
        lastFetchTime = now;
        return cache;
    };
};

const _cachedFetchPlaces = cachedFunction(fetchPlaces, 2 * 60 * 1000); // Cache for 2 minutes

// execute fetchPlaces every 2 minutes and cache the result
let cachedData = null;
const getCachedData = async () => {
    try {
        cachedData = await fetchPlaces();
        console.log("Cached data updated.");
    } catch (error) {
        console.error("Error updating cached data:", error);
    }
};
setInterval(getCachedData, 2 * 60 * 1000); // every 2 minutes
getCachedData(); // initial fetch
const cachedFetchPlaces = async () => {
    if (cachedData) return cachedData;
    return await fetchPlaces();
};

const uniqJoin = (arr) =>
    [...new Set(arr)].reduce((acc, curr, i, a) =>
        i === a.length - 1 ? `${acc} & ${curr}` : `${acc}, ${curr}`,
    );

app.get("/", (req, res) =>
    cachedFetchPlaces()
        .then(async (data) => {
            const rawDataString = JSON.stringify(data, null, 2);
            const indexPath = path.join(__dirname, "public", "index.html");
            const indexContent = await fsPromises.readFile(indexPath, "utf8");
            const newIndexContent = indexContent
                .replace(
                    /\/\* START GET DATA \*\/[\s\S]*?\/\* END GET DATA \*\//,
                    `/* START GET DATA */\nconst RAW_API_DATA = ${rawDataString};\n/* END GET DATA */`,
                )
                .replace(
                    /<!-- START TITLE -->[\s\S]*?<!-- END TITLE -->/,
                    `<!-- START TITLE -->\n<title>Prix des Carburants - ${uniqJoin(config.map((e) => e.name.split("-").at(0).trim()))}</title>\n<!-- END TITLE -->`,
                )
                .replace(
                    /<!-- START RESULTS RESUME -->[\s\S]*?<!-- END RESULTS RESUME -->/,
                    `<!-- START RESULTS RESUME -->\nRésultats des ${data.length} recherches (${uniqJoin(config.map((e) => e.name.split("-").at(0).trim()))})\n<!-- END RESULTS RESUME -->`,
                )
                .replace(
                    /<!-- START BUTTONS -->[\s\S]*?<!-- END BUTTONS -->/,
                    `<!-- START BUTTONS -->\n<button onclick="changerOnglet('TOUT')" id="onglet-TOUT" class="btn-onglet px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-500 text-slate-950 transition">Toutes les recherches (${data.length})</button>\n${config
                        .map(
                            (e) =>
                                `<button class="btn-onglet px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition" onclick="changerOnglet('${e.slug}')" id="onglet-${e.slug}"><i class="mr-1.5 fa-solid ${e.icone} ${e.couleurIcone}"></i> ${e.name}</button>`,
                        )
                        .join("\n")}\n<!-- END BUTTONS -->`,
                );
            res.setHeader("Content-Type", "text/html");
            res.send(newIndexContent);
        })
        .catch((error) => {
            console.error("Error fetching places:", error);
            res.status(500).send("Internal Server Error");
        }),
);

app.use(express.static(path.join(__dirname, "public")));

app.get("/results.json", async (req, res) => {
    try {
        const results = await cachedFetchPlaces();
        res.json(results);
    } catch (error) {
        console.error("Error fetching places:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.use((req, res) => res.redirect("/"));

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
