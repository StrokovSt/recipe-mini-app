export function getGreeting(): string {
    const h = new Date().getHours();
    if (h < 12) return "Доброе утро 👋";
    if (h < 18) return "Добрый день ☀️";
    return "Добрый вечер 🌙";
}