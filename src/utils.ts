export const uniqJoin = (arr: string[]) =>
    [...new Set(arr)].reduce((acc, curr, i, a) =>
        i === a.length - 1 ? `${acc} & ${curr}` : `${acc}, ${curr}`,
    );

export function calculerDistance(
    lat1: number | null,
    lon1: number | null,
    lat2: number | null,
    lon2: number | null,
) {
    if (lat1 == null || lon1 == null || lat2 == null || lon2 == null)
        return null;
    const R = 6371; // Rayon moyen de la Terre en km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1000; // Distance en mètres
}
