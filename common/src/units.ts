// Единицы измерения ингредиентов. Код хранится в рецепте, подписи на каждом языке
// лежат в словарях фронта (namespace units).
// kind — что измеряет единица, factor — сколько граммов (mass) или миллилитров (volume)
// в одной единице. Нужен для пересчёта порций и, позже, калорий.
// У штучных и прочих единиц factor нет: вес штуки зависит от продукта.
export type UnitKind = "mass" | "volume" | "count" | "other";

export interface UnitInfo {
    kind: UnitKind;
    factor: number | null;
}

export const UNITS = {
    g: { kind: "mass", factor: 1 },
    kg: { kind: "mass", factor: 1000 },
    oz: { kind: "mass", factor: 28.35 },
    lb: { kind: "mass", factor: 453.59 },
    ml: { kind: "volume", factor: 1 },
    l: { kind: "volume", factor: 1000 },
    tsp: { kind: "volume", factor: 5 },
    tbsp: { kind: "volume", factor: 15 },
    glass: { kind: "volume", factor: 250 },
    cup_us: { kind: "volume", factor: 240 },
    pcs: { kind: "count", factor: null },
    clove: { kind: "count", factor: null },
    slice: { kind: "count", factor: null },
    bunch: { kind: "count", factor: null },
    sprig: { kind: "count", factor: null },
    can: { kind: "count", factor: null },
    pack: { kind: "count", factor: null },
    pinch: { kind: "other", factor: null },
    handful: { kind: "other", factor: null },
    to_taste: { kind: "other", factor: null },
} as const satisfies Record<string, UnitInfo>;

export type UnitCode = keyof typeof UNITS;

export const UNIT_CODES = Object.keys(UNITS) as [UnitCode, ...UnitCode[]];
