export type ConfigItem = {
    name: string;
    slug: string;
    coords: [number, number];
    fuels: FuelType[];
    radius: number;
    notifRadius: number;
    icone: string;
    couleurIcone: string;
    couleurHex: string;
};

export type GeneralConfig = {
    dataInterval: number;
    logFiles: boolean;
} & (
    | {
          notifEnabled: true;
          notifDiscordEndpoint: string;
      }
    | {
          notifEnabled: false;
      }
);

export const fuelTypes = {
    "E85": "Superéthanol E85",
    "SP5": "Sans-plomb 95",
    "SP8": "Sans-plomb 98",
    "E10": "SP95 E10",
    "GOEX": "Diesel Premier",
    "GO": "Diesel",
    "B10": "Diesel B10",
} as const

export type FuelType = keyof typeof fuelTypes

export const fuelTypesKeys = Object.keys(fuelTypes) as FuelType[]