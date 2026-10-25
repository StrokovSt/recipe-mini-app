// Telegram ID по три цифры через пробел, как в макете: 583274910 → «583 274 910»
export const formatTelegramId = (id: number) => id.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
