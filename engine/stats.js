/**
 * Система управления статистикой
 */
class StatsManager {
    constructor() {
        this.stats = {
            mind: 100,
            heart: 100,
            time: 100,
            drive: 100
        };
        this.maxStat = 100;
        this.callbacks = {
            onStatChange: [],
            onStatZero: []
        };
    }

    /**
     * Применить эффекты к статистике
     * @param {Object} effects - Объект с изменениями статистики
     * @param {number} scoreBonus - Бонус к счету
     * @returns {Object} - Результат изменений
     */
    applyEffects(effects, scoreBonus = 0) {
        const changes = {};
        let anyStatZero = false;
        let zeroStat = null;

        for (const [stat, change] of Object.entries(effects)) {
            if (this.stats.hasOwnProperty(stat)) {
                const oldValue = this.stats[stat];
                this.stats[stat] = Math.max(0, Math.min(this.maxStat, this.stats[stat] + change));
                changes[stat] = {
                    old: oldValue,
                    new: this.stats[stat],
                    change: change
                };

                if (this.stats[stat] === 0 && !anyStatZero) {
                    anyStatZero = true;
                    zeroStat = stat;
                }
            }
        }

        // Вызываем колбэки
        this.callbacks.onStatChange.forEach(cb => cb(changes));

        if (anyStatZero) {
            this.callbacks.onStatZero.forEach(cb => cb(zeroStat));
        }

        return {
            changes,
            anyStatZero,
            zeroStat,
            scoreBonus
        };
    }

    /**
     * Получить текущее значение статистики
     * @param {string} stat - Название статистики
     * @returns {number}
     */
    get(stat) {
        return this.stats[stat] || 0;
    }

    /**
     * Получить все статистики
     * @returns {Object}
     */
    getAll() {
        return { ...this.stats };
    }

    /**
     * Сбросить статистику к начальным значениям
     */
    reset() {
        this.stats = {
            mind: 100,
            heart: 100,
            time: 100,
            drive: 100
        };
    }

    /**
     * Восстановить одну статистику до 30
     * @param {string} stat - Название статистики
     */
    revive(stat) {
        if (this.stats.hasOwnProperty(stat)) {
            this.stats[stat] = Math.min(this.maxStat, Math.max(30, this.stats[stat]));
        }
    }

    /**
     * Получить самую низкую статистику
     * @returns {string|null}
     */
    getLowestStat() {
        let lowest = null;
        let lowestValue = Infinity;

        for (const [stat, value] of Object.entries(this.stats)) {
            if (value < lowestValue) {
                lowestValue = value;
                lowest = stat;
            }
        }

        return lowest;
    }

    /**
     * Получить все статистики ниже порога
     * @param {number} threshold - Пороговое значение
     * @returns {Array}
     */
    getStatsBelow(threshold) {
        const low = [];
        for (const [stat, value] of Object.entries(this.stats)) {
            if (value < threshold) {
                low.push(stat);
            }
        }
        return low;
    }

    /**
     * Подписаться на изменение статистики
     * @param {Function} callback
     */
    onStatChange(callback) {
        this.callbacks.onStatChange.push(callback);
    }

    /**
     * Подписаться на обнуление статистики
     * @param {Function} callback
     */
    onStatZero(callback) {
        this.callbacks.onStatZero.push(callback);
    }
}

