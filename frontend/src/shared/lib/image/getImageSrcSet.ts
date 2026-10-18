import { getImageUrl } from "./getImageUrl";

// Набор копий разной ширины для srcset: браузер сам выбирает подходящую под экран и плотность пикселей.
// Для чужих ссылок Cloudinary не поможет, тогда undefined и остаётся одна картинка из src
export const getImageSrcSet = (url: string, widths: number[]) => {
    if (getImageUrl(url, widths[0]) === url) return undefined;

    return widths.map((width) => `${getImageUrl(url, width)} ${width}w`).join(", ");
};
