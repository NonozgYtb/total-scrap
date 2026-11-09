import { generalConfig } from "./config";
import type { BestPlace, Datas } from "./datas";
import { fuelTypesKeys, type ConfigItem, type FuelType } from "./types/general";
import os from "os";

enum ChangeType {
    PRICE_CHANGE = "PRICE_CHANGE",
    STATION_BECAME_AVAILABLE = "STATION_BECAME_AVAILABLE",
    FUEL_ADDED = "FUEL_ADDED",
    FUEL_REMOVED = "FUEL_REMOVED",
}

const changeLabels: Record<ChangeType, string> = {
    [ChangeType.PRICE_CHANGE]: "Changement de prix",
    [ChangeType.STATION_BECAME_AVAILABLE]: "Nouvelle station",
    [ChangeType.FUEL_ADDED]: "Nouveau carburant",
    [ChangeType.FUEL_REMOVED]: "Carburant retiré",
};

type PriceChange = {
    product_code: FuelType;
    old_price: number | null;
    new_price: number | null;
    modifType:
        | ChangeType.PRICE_CHANGE
        | ChangeType.FUEL_ADDED
        | ChangeType.FUEL_REMOVED;
};

type Change = {
    types: ChangeType[];
    station: Pick<BestPlace, "name" | "address" | "coordinates" | "distance">;
    price_changes: PriceChange[];
};

type Changes = {
    configItem: ConfigItem;
    changes: Change[];
};

const detectChanges = (
    oldData: Datas[number] | null,
    newData: Datas[number],
): Changes => ({
    configItem: newData.place,
    changes: newData.bestPlaces
        .filter(
            (e) =>
                e.distance !== null &&
                e.distance <= newData.place.notifRadius &&
                oldData,
        )
        .map((newPlace): Change => {
            if(newData.place.slug !== oldData?.place.slug) throw new Error("Slug mismatch between old and new data");
            const old = oldData?.bestPlaces.find(
                (oldPlace) => oldPlace.id === newPlace.id,
            );
            if (!old)
                return {
                    types: [ChangeType.STATION_BECAME_AVAILABLE],
                    station: newPlace,
                    price_changes: newPlace.products_and_services.map(
                        (e): PriceChange => ({
                            product_code: e.product_code,
                            old_price: null,
                            new_price: e.price || null,
                            modifType: ChangeType.FUEL_ADDED,
                        }),
                    ),
                };
            const change: Change = {
                types: [],
                station: newPlace,
                price_changes: [],
            };
            fuelTypesKeys.forEach((fuel) => {
                const newProduct = newPlace.products_and_services.find(
                    (p) => p.product_code === fuel,
                );
                const oldProduct = old?.products_and_services.find(
                    (p) => p.product_code === fuel,
                );
                let addToChange: ChangeType | null = null;
                if (newProduct && !oldProduct)
                    addToChange = ChangeType.FUEL_ADDED;
                else if (!newProduct && oldProduct)
                    addToChange = ChangeType.FUEL_REMOVED;
                else if (
                    newProduct &&
                    oldProduct &&
                    newProduct.price !== oldProduct.price
                )
                    addToChange = ChangeType.PRICE_CHANGE;

                if (addToChange) {
                    change.price_changes.push({
                        product_code: fuel,
                        modifType: addToChange,
                        old_price: oldProduct?.price || null,
                        new_price: newProduct?.price || null,
                    });
                    change.types.push(addToChange);
                    console.log(
                        newProduct,
                        oldProduct,
                        fuel,
                        addToChange,
                        change,
                    );
                }
            });
            return change;
        })
        .filter((e) => e.types.length > 0),
});

export const notifyHook = (oldDatas: Datas, newDatas: Datas) =>
    discordNotify(
        newDatas
            .map((e): [Datas[number] | null, Datas[number]] => [
                oldDatas.find((f) => f.place.slug === e.place.slug) || null,
                e,
            ])
            .filter(([oldData]) => oldData !== undefined && oldData !== null)
            .map(([oldData, newData]) => detectChanges(oldData, newData))
            .filter((changes) => changes.changes.length > 0),
    );

const hexToDecimal = (hex: string) => parseInt(hex.replace("#", ""), 16);

const discordNotify = async (changeList: Changes[]) => {
    if (!generalConfig.notifEnabled) return;
    const embeds = changeList.map((changes) => ({
        title: `${changes.configItem.name}`,
        color: hexToDecimal(changes.configItem.couleurHex),
        fields: changes.changes.map((change) => ({
            name: `${change.station.name} (${
                change.station.distance !== null
                    ? change.station.distance < 1000
                        ? `${Math.round(change.station.distance)} m`
                        : `${(change.station.distance / 1000).toFixed(1).replace(".", ",")} km`
                    : "?"
            })`,
            value: [
                ...change.price_changes.map(
                    (price_change) =>
                        `**${price_change.product_code}**   :   \`${price_change.old_price || "?"}\`   →   \`${price_change.new_price || "?"}\`   *(${changeLabels[price_change.modifType]})*`,
                ),
                change.types.includes(ChangeType.STATION_BECAME_AVAILABLE)
                    ? "(Nouvelle station)"
                    : "",
                `*${change.station.address}*`,
            ]
                .filter(Boolean)
                .join("\n"),
        })),

        footer: {
            text: `Mise à jour : ${new Date().toLocaleString("fr-FR", { timeZone: "Europe/Paris" }).replace(" ", " à ")}`,
        },
    }));
    if (!embeds.length) return;
    await fetch(generalConfig.notifDiscordEndpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            content: null,
            embeds,
            attachments: [],
        }),
    })
        .then((res) =>
            console.log(
                `[${new Date().toLocaleString("fr-FR")}] Discord notification sent with status ${res.status}`,
            ),
        )
        .catch((err) =>
            console.error(
                `[${new Date().toLocaleString("fr-FR")}] Error sending Discord notification:`,
                err,
            ),
        );
};

export const discordInit = async () => {
    if (!generalConfig.notifEnabled) return;
    const ip = await fetch("https://api.ipify.org")
        .then((res) => res.text())
        .catch(() => "N/A");
    const localIp =
        Object.entries(os.networkInterfaces())
            .filter(([name, interfaces]) => name !== "lo" && interfaces?.length)
            .flatMap(
                ([name, interfaces]) =>
                    `- ${name}: ${interfaces
                        ?.map((e) => e.address)
                        .filter(Boolean)
                        .join(", ")}`,
            )
            .join("\n") || "N/A";

    const embed = {
        title: "Service started",
        color: 0x808080, // Grey
        fields: [
            {
                name: "IPs",
                value: `Publique : ${ip}\nLocale :\n${localIp}`,
            },
            {
                name: "Timestamp",
                value: new Date().toLocaleString("fr-FR", {
                    timeZone: "Europe/Paris",
                }),
                inline: true,
            },
            {
                name: "Container Name",
                value: os.hostname() || "N/A",
                inline: true,
            },
        ],
    };

    await fetch(generalConfig.notifDiscordEndpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            content: null,
            embeds: [embed],
            attachments: [],
        }),
    })
        .then(async (res) =>
            console.log(
                `[${new Date().toLocaleString("fr-FR")}] Discord init notification sent with status ${res.status}`,
                await res.text(),
            ),
        )
        .catch((err) =>
            console.error(
                `[${new Date().toLocaleString("fr-FR")}] Error sending Discord init notification:`,
                err,
            ),
        );
};
