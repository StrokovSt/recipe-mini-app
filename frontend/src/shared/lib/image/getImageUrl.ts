// Картинки рецептов хранятся в Cloudinary оригиналами (фото с телефона весит мегабайты).
// Cloudinary умеет отдавать уменьшенную копию: параметры вставляются в ссылку после /upload/.
// f_auto — webp/avif, если браузер умеет; q_auto — сжатие без видимой потери; c_limit — только уменьшать
const CLOUDINARY_UPLOAD = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)/;

// Ширина в пикселях с запасом на экраны с высокой плотностью. Чужие ссылки возвращаются как есть
export const getImageUrl = (url: string, width: number) =>
    url.replace(CLOUDINARY_UPLOAD, `$1f_auto,q_auto,c_limit,w_${width}/`);
