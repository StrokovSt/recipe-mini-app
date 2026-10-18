// Первая страница показана полностью: котик ушёл, картинки загрузились. После этого можно грузить
// второстепенное, не отбирая сеть у контента
let resolveFirstPageShown: () => void = () => {};

export const firstPageShown = new Promise<void>((resolve) => {
    resolveFirstPageShown = resolve;
});

export const markFirstPageShown = () => resolveFirstPageShown();
