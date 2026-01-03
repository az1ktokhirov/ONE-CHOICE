/**
 * Менеджер цитат и фраз
 */
class QuotesManager {
    constructor(language = 'ru') {
        this.language = language;
        this.usedQuotes = new Set();
        this.quotes = {
            ru: {
                menu: [
                    "Каждое решение имеет цену.",
                    "Нет правильного выбора.",
                    "Все пути ведут к коллапсу.",
                    "Вы уже проиграли.",
                    "Неважно, что вы выберете.",
                    "Конец неизбежен.",
                    "Ваши решения ничего не меняют.",
                    "Выбор — это иллюзия.",
                    "Все равно будет больно.",
                    "Нет выхода."
                ],
                preGame: [
                    "Хороших решений не существует.",
                    "Вы уже знаете, чем это закончится.",
                    "Начните. Снова.",
                    "Каждый выбор приближает конец.",
                    "Не пытайтесь выиграть."
                ],
                gameOver: [
                    "Это было неизбежно.",
                    "Вы знали, что это произойдет.",
                    "Снова.",
                    "Ничего не изменилось.",
                    "Попробуйте еще раз. Или не пытайтесь."
                ],
                restart: [
                    "На этот раз вы выберете иначе.",
                    "Попробуйте снова.",
                    "Ничего не изменится.",
                    "Вы уже знаете исход.",
                    "Продолжайте."
                ]
            },
            en: {
                menu: [
                    "Every decision has a price.",
                    "There is no right choice.",
                    "All paths lead to collapse.",
                    "You have already lost.",
                    "It doesn't matter what you choose.",
                    "The end is inevitable.",
                    "Your decisions change nothing.",
                    "Choice is an illusion.",
                    "It will hurt anyway.",
                    "There is no way out."
                ],
                preGame: [
                    "Good decisions do not exist.",
                    "You already know how this ends.",
                    "Begin. Again.",
                    "Every choice brings the end closer.",
                    "Don't try to win."
                ],
                gameOver: [
                    "This was inevitable.",
                    "You knew this would happen.",
                    "Again.",
                    "Nothing has changed.",
                    "Try again. Or don't."
                ],
                restart: [
                    "This time you will choose differently.",
                    "Try again.",
                    "Nothing will change.",
                    "You already know the outcome.",
                    "Continue."
                ]
            }
        };
    }

    /**
     * Получить случайную цитату
     * @param {string} category - Категория (menu, preGame, gameOver, restart)
     * @returns {string}
     */
    getQuote(category) {
        const quotes = this.quotes[this.language]?.[category] || [];
        if (quotes.length === 0) {
            return '';
        }

        // Если все цитаты использованы, сбрасываем
        if (this.usedQuotes.size >= quotes.length) {
            this.usedQuotes.clear();
        }

        // Выбираем неиспользованную цитату
        let availableQuotes = quotes.filter((_, index) => !this.usedQuotes.has(index));
        if (availableQuotes.length === 0) {
            availableQuotes = quotes;
            this.usedQuotes.clear();
        }

        const randomIndex = Math.floor(Math.random() * availableQuotes.length);
        const quote = availableQuotes[randomIndex];
        const originalIndex = quotes.indexOf(quote);
        
        this.usedQuotes.add(originalIndex);
        
        return quote;
    }

    /**
     * Сбросить использованные цитаты
     */
    reset() {
        this.usedQuotes.clear();
    }

    /**
     * Установить язык
     * @param {string} language - Язык (ru, en)
     */
    setLanguage(language) {
        this.language = language;
        this.reset();
    }
}

