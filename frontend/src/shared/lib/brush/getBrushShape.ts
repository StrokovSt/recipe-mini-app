// Сколько форм мазка нарисовано: shared/assets/images/brush, photo-N, wash-N и stroke-N
export const BRUSH_SHAPES = 6;

// Форма мазка по месту карточки в списке: формы идут по очереди, соседние всегда разные
export const getBrushShape = (index: number) => index % BRUSH_SHAPES + 1;
