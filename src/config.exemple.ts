import type { ConfigItem, GeneralConfig } from "./types/general";

/**
 *
 * name : Nom de la recherche
 * slug : Slug de la recherche (utilisé en interne)
 * fuels : GO, B10 : Diesel / SP8, SP5, E10 : Essence
 * coords : Coordonnées du centre de la recherche
 * radius : Rayon de la recherche (en mètres)
 * icone : Icône Font Awesome de la recherche
 * couleurIcone : Couleur de l'icône de la recherche (classe tailwind)
 *
 * */
export const config: ConfigItem[] = [
        {
        name: "Nantes - Essence",
        slug: "nantes-essence",
        coords: [47.218371, -1.553621],
        fuels: ["SP8", "SP5", "E10"],
        radius: 30_000,
        notifRadius: 10_000,
        icone: "fa-car",
        couleurIcone: "text-teal-500 dark:text-teal-400",
        couleurHex: "#14b8a6"
    },
    {
        name: "Nantes - Diesel",
        slug: "nantes-diesel",
        coords: [47.218371, -1.553621],
        fuels: ["GO", "GOEX", "B10"],
        radius: 30_000,
        notifRadius: -1,
        icone: "fa-truck-monster",
        couleurIcone: "text-rose-500 dark:text-rose-400",
        couleurHex: "#f43f5e"
    },
];

export const generalConfig: GeneralConfig = {
    notifEnabled: true,
    notifDiscordEndpoint:
        "https://discord.com/api/webhooks/1234567890123456789/abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ", // note : max 5 notifs (notifRadius > 0)
    dataInterval: 5, // min
    logFiles: true, // log files in ./dist/logs/
};
