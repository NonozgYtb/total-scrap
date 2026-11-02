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
const config = [
    {
        name: "Nantes - Essence",
        slug: "nantes-essence",
        coords: [47.218371, -1.553621],
        fuels: ["SP8", "SP5", "E10"],
        radius: 30_000,
        icone: "fa-car",
        couleurIcone: "text-teal-500 dark:text-teal-400",
    },
    {
        name: "Nantes - Diesel",
        slug: "nantes-diesel",
        coords: [47.218371, -1.553621],
        fuels: ["GO", "B10"],
        radius: 30_000,
        icone: "fa-truck-monster",
        couleurIcone: "text-rose-500 dark:text-rose-400",
    },
];

module.exports = config;
