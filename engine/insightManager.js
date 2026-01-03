/**
 * Менеджер системы Insight (ОСОЗНАНИЕ)
 */
class InsightManager {
    constructor() {
        this.insight = 0;
        this.unlockedModifiers = [];
        this.unlockedScenes = [];
        this.permanentBonuses = {
            mind: 0,
            heart: 0,
            time: 0,
            drive: 0
        };
    }

    /**
     * Вычислить Insight за запуск
     * @param {number} choicesMade - Количество сделанных выборов
     * @param {string} difficulty - Сложность
     * @returns {number}
     */
    calculateInsight(choicesMade, difficulty) {
        let baseInsight = choicesMade;
        
        // Множители сложности
        const multipliers = {
            easy: 0.5,
            normal: 1.0,
            hard: 1.5
        };
        
        const multiplier = multipliers[difficulty] || 1.0;
        const insight = Math.floor(baseInsight * multiplier);
        
        return Math.max(0, insight);
    }

    /**
     * Добавить Insight
     * @param {number} amount - Количество Insight
     */
    addInsight(amount) {
        this.insight += amount;
        this.save();
    }

    /**
     * Получить текущий Insight
     * @returns {number}
     */
    getInsight() {
        return this.insight;
    }

    /**
     * Проверить, можно ли разблокировать модификатор
     * @param {string} modifierId - ID модификатора
     * @returns {boolean}
     */
    canUnlockModifier(modifierId) {
        const cost = this.getModifierCost(modifierId);
        return this.insight >= cost && !this.unlockedModifiers.includes(modifierId);
    }

    /**
     * Разблокировать модификатор
     * @param {string} modifierId - ID модификатора
     * @returns {boolean}
     */
    unlockModifier(modifierId) {
        if (this.canUnlockModifier(modifierId)) {
            const cost = this.getModifierCost(modifierId);
            this.insight -= cost;
            this.unlockedModifiers.push(modifierId);
            this.save();
            return true;
        }
        return false;
    }

    /**
     * Получить стоимость модификатора
     * @param {string} modifierId - ID модификатора
     * @returns {number}
     */
    getModifierCost(modifierId) {
        // Базовая стоимость модификаторов
        return 50;
    }

    /**
     * Получить разблокированные модификаторы
     * @returns {Array}
     */
    getUnlockedModifiers() {
        return [...this.unlockedModifiers];
    }

    /**
     * Применить постоянные бонусы к статистике
     * @param {Object} baseStats - Базовые статистики
     * @returns {Object}
     */
    applyPermanentBonuses(baseStats) {
        const modified = { ...baseStats };
        for (const [stat, bonus] of Object.entries(this.permanentBonuses)) {
            if (modified[stat] !== undefined) {
                modified[stat] = Math.min(100, modified[stat] + bonus);
            }
        }
        return modified;
    }

    /**
     * Сохранить данные
     */
    save() {
        try {
            localStorage.setItem('onechoice_insight', JSON.stringify({
                insight: this.insight,
                unlockedModifiers: this.unlockedModifiers,
                unlockedScenes: this.unlockedScenes,
                permanentBonuses: this.permanentBonuses
            }));
        } catch (error) {
            console.warn('Не удалось сохранить Insight:', error);
        }
    }

    /**
     * Загрузить данные
     */
    load() {
        try {
            const saved = localStorage.getItem('onechoice_insight');
            if (saved) {
                const data = JSON.parse(saved);
                this.insight = data.insight || 0;
                this.unlockedModifiers = data.unlockedModifiers || [];
                this.unlockedScenes = data.unlockedScenes || [];
                this.permanentBonuses = data.permanentBonuses || {
                    mind: 0,
                    heart: 0,
                    time: 0,
                    drive: 0
                };
            }
        } catch (error) {
            console.warn('Не удалось загрузить Insight:', error);
        }
    }
}

