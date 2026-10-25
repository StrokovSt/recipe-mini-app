import { describe, expect, it } from "vitest";

import { formatTelegramId } from "./formatTelegramId";

describe("formatTelegramId", () => {
    it("делит на тройки с конца", () => {
        expect(formatTelegramId(583274910)).toBe("583 274 910");
        expect(formatTelegramId(1234567890)).toBe("1 234 567 890");
    });

    it("короткий ID без пробелов", () => {
        expect(formatTelegramId(777)).toBe("777");
    });
});
