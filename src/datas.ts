import { generalConfig } from "./config";
import { config } from "./config";
import { notifyHook } from "./notif";
import { getPOIInfo, makeReq } from "./query";
import type { FuelType } from "./types/general";
import { calculerDistance } from "./utils";
import fsPromises from "fs/promises";
import path from "path";

export const fetchPlaces = async () =>
    Promise.all(
        config.map((place) =>
            makeReq(
                place.coords[0]!,
                place.coords[1]!,
                place.radius,
                place.fuels,
            ).then(async (e) => {
                if (
                    !e ||
                    !("features" in e) ||
                    !e.features ||
                    e.features.length === 0
                )
                    return { place, bestPlaces: [] };
                const res = await Promise.all(
                    e.features.map((f) =>
                        getPOIInfo(
                            f.properties.user_properties.location_id,
                        ).then((infos) => ({
                            ...infos,
                            interesting:
                                infos.products_and_services?.filter(
                                    (e) =>
                                        place.fuels.includes(
                                            e.product_code as FuelType,
                                        ) &&
                                        e.availability_status !==
                                            "UNAVAILABLE" &&
                                        e.availability_status !== "UNKNOWN",
                                ) || [],
                        })),
                    ),
                ).then((e) => e.filter((e) => e.interesting.length > 0));
                const bestPlaces = res.map((bestPlace) => ({
                    id: bestPlace.location_id,
                    name: bestPlace.contractual_name || bestPlace.business_name,
                    opened:
                        bestPlace.current_business_opening_status_code ===
                        "OPEN",
                    opening_hours:
                        bestPlace.current_business_opening_hour_period,
                    address: `${bestPlace.street_address} ${bestPlace.zip_code} ${bestPlace.city}`,
                    "24/7": bestPlace.automate_24 == "24/7",
                    coordinates: [bestPlace.longitude, bestPlace.latitude],
                    distance: calculerDistance(
                        place.coords[0]!,
                        place.coords[1]!,
                        bestPlace.latitude,
                        bestPlace.longitude,
                    ),
                    products_and_services: bestPlace.interesting.map((e) => ({
                        product_code: e.product_code as FuelType,
                        availability_status: e.availability_status,
                        price: e.price,
                        product_name: e.product_name,
                        update_time: e.price_update_date_time,
                    })),
                }));

                return { place, bestPlaces };
            }),
        ),
    );

// create a method to cache the results of fetchPlaces and update the cache every 5 minutes
let cachedResults: Awaited<ReturnType<typeof fetchPlaces>> | null = null;
let lastFetchTime: number | null = null;

const makeFetch = async () => {
    try {
        const datas = await fetchPlaces();
        if (generalConfig.notifEnabled && cachedResults)
            notifyHook(cachedResults, datas);

        cachedResults = structuredClone(datas);
        lastFetchTime = Date.now();

        if (generalConfig.logFiles) {
            const logsDir = path.join(import.meta.dirname, "logs");
            fsPromises.mkdir(logsDir, { recursive: true }).then(() => {
                const logFilePath = path.join(
                    logsDir,
                    `log_${new Date()
                        .toISOString()
                        .replaceAll("T", "_")
                        .replace(/[:.\-A-Z]/g, "")
                        .slice(0, 15)}.json`,
                );
                fsPromises
                    .writeFile(logFilePath, JSON.stringify(datas, null, 2))
                    .then(() => {
                        console.log(
                            `[${new Date().toLocaleString("fr-FR")}] Log file created at ${logFilePath}`,
                        );
                    })
                    .catch((err) => {
                        console.error(
                            `[${new Date().toLocaleString("fr-FR")}] Error writing log file: ${err}`,
                        );
                    });
            });
        }
        cachedResults = datas;
        lastFetchTime = Date.now();
        console.log(
            `[${new Date().toLocaleString("fr-FR")}] Fetched and cached results for ${datas.length} places (${datas.reduce((acc, curr) => acc + curr.bestPlaces.length, 0)} best places).`,
        );
    } catch (err) {
        console.error(
            `[${new Date().toLocaleString("fr-FR")}] Error during fetch or logging:`,
            err,
        );
    }
};

export const initializeCache = async () => {
    makeFetch();
    setInterval(makeFetch, generalConfig.dataInterval * 60 * 1000);
};

export const getCachedResults = async (): Promise<{
    datas: Datas;
    lastFetchTime: number;
}> => {
    if (!cachedResults || !lastFetchTime) await makeFetch();
    return { datas: cachedResults!, lastFetchTime: lastFetchTime! }!;
};

export type Datas = Awaited<ReturnType<typeof fetchPlaces>>;

export type BestPlace = Datas[number]["bestPlaces"][number];
