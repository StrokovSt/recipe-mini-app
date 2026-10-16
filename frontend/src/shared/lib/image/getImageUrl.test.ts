import { describe, expect, it } from "vitest";

import { getImageUrl } from "./getImageUrl";

describe("getImageUrl", () => {
    it("вставляет параметры уменьшения в ссылку Cloudinary", () => {
        const url = "https://res.cloudinary.com/demo/image/upload/v123/recipes/cake.jpg";

        expect(getImageUrl(url, 600)).toBe(
            "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_limit,w_600/v123/recipes/cake.jpg"
        );
    });

    it("не трогает чужие ссылки и видео", () => {
        const pinterest = "https://i.pinimg.com/736x/cake.jpg";
        const video = "https://res.cloudinary.com/demo/video/upload/v123/recipes/cake.mp4";

        expect(getImageUrl(pinterest, 600)).toBe(pinterest);
        expect(getImageUrl(video, 600)).toBe(video);
    });
});
