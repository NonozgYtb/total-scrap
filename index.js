const fs = require("fs");
const { makeReq, getPOIInfo } = require("./query");
const config = require("./config");

const fetchPlaces = async () => {
    const prom = config.map((place) =>
        makeReq(
            place.coords[0],
            place.coords[1],
            place.radius,
            place.fuels,
        ).then(async (e) => {
            const res = await Promise.all(
                e.features.map((f) =>
                    getPOIInfo(f.properties.user_properties.location_id).then(
                        (infos) => ({
                            ...infos,
                            interesting:
                                infos.products_and_services?.filter(
                                    (e) =>
                                        place.fuels.includes(e.product_code) &&
                                        e.availability_status !==
                                            "UNAVAILABLE" &&
                                        e.availability_status !== "UNKNOWN",
                                ) || [],
                        }),
                    ),
                ),
            ).then((e) => e.filter((e) => e.interesting.length > 0));
            const bestPlaces = res.map((bestPlace) => ({
                name: bestPlace.contractual_name || bestPlace.business_name,
                opened:
                    bestPlace.current_business_opening_status_code === "OPEN",
                opening_hours: bestPlace.current_business_opening_hour_period,
                address: `${bestPlace.street_address} ${bestPlace.zip_code} ${bestPlace.city}`,
                "24/7": bestPlace.automate_24 == "24/7",
                coordinates: [bestPlace.longitude, bestPlace.latitude],
                products_and_services: bestPlace.products_and_services
                    .filter(
                        (e) =>
                            place.fuels.includes(e.product_code) &&
                            e.availability_status !== "UNAVAILABLE" &&
                            e.availability_status !== "UNKNOWN",
                    )
                    .map((e) => ({
                        product_code: e.product_code,
                        availability_status: e.availability_status,
                        price: e.price,
                        product_name: e.product_name,
                        update_time: e.price_update_date_time,
                    })),
            }));

            return { place, bestPlaces };
        }),
    );

    return await Promise.all(prom);
};

/* try {
    fetchPlaces()
        .then((r) =>
            fs.writeFileSync("results.json", JSON.stringify(r, null, 2)),
        ).then(() => console.log("results.json has been created successfully."))
        .catch((error) =>
            console.error("Error occurred while fetching places:", error),
        );
} catch (error) {
    console.error("Error occurred while fetching places:", error);
} */

module.exports = {
    fetchPlaces,
    config,
};
