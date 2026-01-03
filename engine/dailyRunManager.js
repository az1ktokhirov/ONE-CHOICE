/**
 * Менеджер ежедневных запусков
 */
class DailyRunManager {
    constructor() {
        this.lastDailyDate = null;
        this.dailyCompleted = false;
        this.dailySeed = null;
    }

    /**
     * Проверить, доступен ли ежедневный запуск
     * @returns {boolean}
     */
    isDailyAvailable() {
        const today = this.getTodayDate();
        
        if (!this.lastDailyDate) {
            return true;
        }
        
        return this.lastDailyDate !== today;
    }

    /**
     * Начать ежедневный запуск
     * @returns {Object} Данные ежедневного запуска
     */
    startDailyRun() {
        const today = this.getTodayDate();
        
        if (!this.isDailyAvailable()) {
            return null;
        }
        
        // Генерируем seed на основе даты
        this.dailySeed = this.generateDateSeed(today);
        this.lastDailyDate = today;
        this.dailyCompleted = false;
        this.save();
        
        return {
            seed: this.dailySeed,
            date: today,
            isDaily: true
        };
    }

    /**
     * Завершить ежедневный запуск
     */
    completeDailyRun() {
        this.dailyCompleted = true;
        this.save();
    }

    /**
     * Получить сегодняшнюю дату в формате YYYY-MM-DD
     * @returns {string}
     */
    getTodayDate() {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    }

    /**
     * Сгенерировать seed на основе даты
     * @param {string} date - Дата в формате YYYY-MM-DD
     * @returns {number}
     */
    generateDateSeed(date) {
        // Простой хеш даты для создания детерминированного seed
        let hash = 0;
        for (let i = 0; i < date.length; i++) {
            const char = date.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash);
    }

    /**
     * Получить seed для ежедневного запуска
     * @returns {number|null}
     */
    getDailySeed() {
        return this.dailySeed;
    }

    /**
     * Сохранить данные
     */
    save() {
        try {
            localStorage.setItem('onechoice_daily', JSON.stringify({
                lastDailyDate: this.lastDailyDate,
                dailyCompleted: this.dailyCompleted,
                dailySeed: this.dailySeed
            }));
        } catch (error) {
            console.warn('Не удалось сохранить ежедневный запуск:', error);
        }
    }

    /**
     * Загрузить данные
     */
    load() {
        try {
            const saved = localStorage.getItem('onechoice_daily');
            if (saved) {
                const data = JSON.parse(saved);
                this.lastDailyDate = data.lastDailyDate;
                this.dailyCompleted = data.dailyCompleted || false;
                this.dailySeed = data.dailySeed;
                
                // Проверяем, не устарела ли дата
                const today = this.getTodayDate();
                if (this.lastDailyDate !== today) {
                    this.dailyCompleted = false;
                }
            }
        } catch (error) {
            console.warn('Не удалось загрузить ежедневный запуск:', error);
        }
    }
}

