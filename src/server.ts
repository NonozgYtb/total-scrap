import express from "express";
import path from "path";
import type { Datas } from "./datas";

export const attachStaticServer = (
    app: express.Express,
    getDatas: () => Promise<{datas: Datas, lastFetchTime: number}>,
) => {
    app.set("view engine", "ejs");
    app.set("views", path.join(import.meta.dirname, "views"));
    app.get("/", (req, res) => {
        getDatas().then((data) => res.render("index", data));
    });

    app.use(express.static(path.join(import.meta.dirname, "..", "public")));

    app.get("/results", async (req, res) => {
        try {
            const results = await getDatas();
            res.json(results);
        } catch (error) {
            console.error(`[${new Date().toLocaleString("fr-FR")}] Error fetching places :`, error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    });

    app.use((_req, res) => res.redirect("/"));
};
