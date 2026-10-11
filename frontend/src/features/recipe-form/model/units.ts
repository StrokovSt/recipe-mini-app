import { UNIT_CODES, type UnitCode, type UnitKind,UNITS } from "@recipe/common";

// Порядок групп в шторке выбора единицы
export const UNIT_KINDS: UnitKind[] = ["mass", "volume", "count", "other"];

// Для этих языков американские меры привычнее, они идут первыми в своей группе
const IMPERIAL_LANGUAGES = ["en"];
const IMPERIAL_UNITS: UnitCode[] = ["oz", "lb", "cup_us"];

export const getUnitsByKind = (kind: UnitKind, language: string): UnitCode[] => {
    const codes = UNIT_CODES.filter((code) => UNITS[code].kind === kind);
    if (!IMPERIAL_LANGUAGES.includes(language)) return codes;

    return [
        ...codes.filter((code) => IMPERIAL_UNITS.includes(code)),
        ...codes.filter((code) => !IMPERIAL_UNITS.includes(code)),
    ];
};
