import { describe, expect, it } from "vitest";

import { getImageSrcSet } from "./getImageSrcSet";

describe("getImageSrcSet", () => {
    it("собирает копии Cloudinary нужной ширины", () => {
        const url = "https://res.cloudinary.com/demo/image/upload/v123/recipes/cake.jpg";

        expect(getImageSrcSet(url, [300, 600])).toBe(
            "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_limit,w_300/v123/recipes/cake.jpg 300w, "
            + "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_limit,w_600/v123/recipes/cake.jpg 600w"
        );
    });

    it("для чужих ссылок ничего не возвращает", () => {
        expect(getImageSrcSet("https://i.pinimg.com/736x/cake.jpg", [300, 600])).toBeUndefined();
    });
});
