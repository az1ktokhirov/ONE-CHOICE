/**
 * Менеджер концовок
 */
class EndingsManager {
    constructor(languageManager = null) {
        this.unlockedEndings = new Set();
        this.languageManager = languageManager;
        // Концовки теперь загружаются динамически из languageManager
        this.endingIds = ['mind', 'heart', 'time', 'drive', 'burnout', 'obsession', 'emptiness', 'sacrifice'];
    }

    /**
     * Получить все концовки с данными из languageManager
     */
    getAllEndings() {
        if (!this.languageManager) {
            return [];
        }

        return this.endingIds.map(id => {
            const title = this.languageManager.getText(`endings.${id}.title`);
            const description = this.languageManager.getText(`endings.${id}.description`);
            return {
                id: id,
                title: title,
                description: description,
                unlocked: this.unlockedEndings.has(id)
            };
        });
    }

    /**
     * Получить условия разблокировки концовок
     */
    getUnlockConditions() {
        return {
            mind: (zeroStat) => zeroStat === 'mind',
            heart: (zeroStat) => zeroStat === 'heart',
            time: (zeroStat) => zeroStat === 'time',
            drive: (zeroStat) => zeroStat === 'drive',
            burnout: (stats) => {
                // Все статистики ниже 20
                return Object.values(stats).every(s => s < 20);
            },
            obsession: (stats, zeroStat) => {
                // Одна статистика выше 80, остальные ниже 10
                const values = Object.values(stats);
                const max = Math.max(...values);
                const min = Math.min(...values);
                return max > 80 && min < 10;
            },
            emptiness: (stats) => {
                // Все статистики между 20 и 40
                return Object.values(stats).every(s => s >= 20 && s <= 40);
            },
            sacrifice: (stats, zeroStat) => {
                // Сердце и Время обнулены
                return zeroStat === 'heart' || zeroStat === 'time';
            }
        };
    }

    /**
     * Разблокировать концовку
     * @param {string} endingId - ID концовки
     */
    unlockEnding(endingId) {
        this.unlockedEndings.add(endingId);
        this.save();
    }

    /**
     * Проверить и разблокировать концовки на основе условий
     * @param {string} zeroStat - Обнуленная статистика
     * @param {Object} finalStats - Финальные статистики
     */
    checkAndUnlockEndings(zeroStat, finalStats) {
        const conditions = this.getUnlockConditions();
        
        for (const endingId of this.endingIds) {
            if (!this.unlockedEndings.has(endingId)) {
                const condition = conditions[endingId];
                if (condition && condition(finalStats, zeroStat)) {
                    this.unlockEnding(endingId);
                }
            }
        }
    }

    /**
     * Установить languageManager
     */
    setLanguageManager(languageManager) {
        this.languageManager = languageManager;
    }

    /**
     * Получить количество разблокированных концовок
     * @returns {number}
     */
    getUnlockedCount() {
        return this.unlockedEndings.size;
    }

    /**
     * Сохранить данные
     */
    save() {
        try {
            localStorage.setItem('onechoice_endings', JSON.stringify(Array.from(this.unlockedEndings)));
        } catch (error) {
            console.warn('Не удалось сохранить концовки:', error);
        }
    }

    /**
     * Загрузить данные
     */
    load() {
        try {
            const saved = localStorage.getItem('onechoice_endings');
            if (saved) {
                const endings = JSON.parse(saved);
                this.unlockedEndings = new Set(endings);
            }
        } catch (error) {
            console.warn('Не удалось загрузить концовки:', error);
        }
    }
}

