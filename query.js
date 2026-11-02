/**
 * Converts a structured object into a Woosmap / Lucene query string.
 * - Array values for a key are combined with `OR` and wrapped in parentheses.
 * - Key-value groups are combined with `AND`.
 */
function buildWoosmapQuery(filterObj) {
    const clauses = Object.entries(filterObj)
        .map(([key, value]) => {
            if (value === null || value === undefined) return null;

            const values = Array.isArray(value) ? value : [value];
            if (values.length === 0) return null;

            const conditionStr = values
                .map((val) => `${key}:"${val}"`)
                .join(" OR ");
            return values.length > 1 ? `(${conditionStr})` : conditionStr;
        })
        .filter(Boolean);

    return clauses.join(" AND ");
}

const getFilters = (fuels) => ({
    tag: fuels,
    type: [
        "OPEN-TOTAL-FUELING",
        "OPEN-TWASH-FUELING",
        "OPEN-ACCESS-FUELING",
        "OPEN-ELAN-FUELING",
        /*         "OPEN-TOTAL-WASH",
        "OPEN-TWASH-WASH",
        "OPEN-ACCESS-WASH",
        "OPEN-ELAN-WASH",
        "OPEN-TOTAL-EV",
        "OPEN-TWASH-EV",
        "OPEN-ACCESS-EV",
        "OPEN-ELAN-EV", */
    ],
    "user.business": ["retail", "general_trade", "ev"],
    "user.country": "FR",
});

const ApiKeyWoos = [
    119, 111, 111, 115, 45, 99, 50, 51, 54, 99, 54, 102, 51, 45, 51, 49, 102,
    101, 45, 51, 49, 49, 56, 45, 56, 50, 101, 55, 45, 97, 49, 57, 99, 97, 52,
    50, 52, 54, 54, 102, 55,
]
    .map((e) => String.fromCharCode(e))
    .join("");

const ApiKeyTGS = [
    83, 67, 46, 56, 81, 126, 51, 50, 112, 51, 99, 78, 82, 54, 111, 86, 82, 87,
    121, 72, 80, 112, 112, 83, 56, 74, 100, 87, 71, 86, 53, 45, 76, 120, 110,
    72, 85, 97, 69, 85,
]
    .map((e) => String.fromCharCode(e))
    .join("");

const makeReq = (lat, lng, radius, fuels) =>
    fetch(
        `https://api.woosmap.com/stores/search/?${new URLSearchParams({
            lat,
            lng,
            radius,
            query: buildWoosmapQuery(getFilters(fuels)),
            key: ApiKeyWoos,
        }).toString()}`,
        {
            referrer: "https://services.totalenergies.fr/",
            method: "GET",
            mode: "cors",
            credentials: "omit",
        },
    ).then((res) => res.json());

const getPOIInfo = (location_id) =>
    fetch(
        `https://apis.poifinder.alzp.tgscloud.net/poi-finder-store-locator-back/api/v1/point-of-interest?location_id=${location_id}&type=FUELING`,
        {
            headers: {
                accept: "application/json",
                "accept-language":
                    "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7,ja;q=0.6",
                "api-key": ApiKeyTGS,
                priority: "u=1, i",
            },
            referrer: "https://services.totalenergies.fr/",
            body: null,
            method: "GET",
            mode: "cors",
            credentials: "omit",
        },
    ).then((res) => res.json());

module.exports = {
    buildWoosmapQuery,
    getFilters,
    makeReq,
    getPOIInfo,
};
