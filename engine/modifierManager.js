/**
 * Менеджер модификаторов
 */
class ModifierManager {
    constructor(languageManager = null) {
        this.currentModifier = null;
        this.languageManager = languageManager;
        this.allModifiers = [
            {
                id: 'fast_mind',
                nameKey: 'modifier.fast_mind.name',
                descriptionKey: 'modifier.fast_mind.description',
                effect: (stats, choiceEffects) => {
                    if (choiceEffects.mind) {
                        choiceEffects.mind = Math.floor(choiceEffects.mind * 1.5);
                    }
                    return choiceEffects;
                }
            },
            {
                id: 'fast_heart',
                nameKey: 'modifier.fast_heart.name',
                descriptionKey: 'modifier.fast_heart.description',
                effect: (stats, choiceEffects) => {
                    if (choiceEffects.heart) {
                        choiceEffects.heart = Math.floor(choiceEffects.heart * 1.5);
                    }
                    return choiceEffects;
                }
            },
            {
                id: 'fast_time',
                nameKey: 'modifier.fast_time.name',
                descriptionKey: 'modifier.fast_time.description',
                effect: (stats, choiceEffects) => {
                    if (choiceEffects.time) {
                        choiceEffects.time = Math.floor(choiceEffects.time * 1.5);
                    }
                    return choiceEffects;
                }
            },
            {
                id: 'fast_drive',
                nameKey: 'modifier.fast_drive.name',
                descriptionKey: 'modifier.fast_drive.description',
                effect: (stats, choiceEffects) => {
                    if (choiceEffects.drive) {
                        choiceEffects.drive = Math.floor(choiceEffects.drive * 1.5);
                    }
                    return choiceEffects;
                }
            },
            {
                id: 'double_effect',
                nameKey: 'modifier.double_effect.name',
                descriptionKey: 'modifier.double_effect.description',
                effect: (stats, choiceEffects, choiceNumber) => {
                    if (choiceNumber % 5 === 0) {
                        // Добавляем эффект к случайной статистике
                        const statsList = ['mind', 'heart', 'time', 'drive'];
                        const affectedStats = Object.keys(choiceEffects);
                        const availableStats = statsList.filter(s => !affectedStats.includes(s));
                        if (availableStats.length > 0) {
                            const randomStat = availableStats[Math.floor(Math.random() * availableStats.length)];
                            choiceEffects[randomStat] = (choiceEffects[randomStat] || 0) - 5;
                        }
                    }
                    return choiceEffects;
                }
            },
            {
                id: 'no_recovery',
                nameKey: 'modifier.no_recovery.name',
                descriptionKey: 'modifier.no_recovery.description',
                lockedStat: null,
                effect: (stats, choiceEffects) => {
                    // Определяем самую низкую статистику и блокируем её восстановление
                    if (!this.currentModifier.lockedStat) {
                        let lowest = null;
                        let lowestValue = Infinity;
                        for (const [stat, value] of Object.entries(stats)) {
                            if (value < lowestValue) {
                                lowestValue = value;
                                lowest = stat;
                            }
                        }
                        this.currentModifier.lockedStat = lowest;
                    }
                    // Убираем положительные эффекты для заблокированной статистики
                    if (this.currentModifier.lockedStat && choiceEffects[this.currentModifier.lockedStat] > 0) {
                        choiceEffects[this.currentModifier.lockedStat] = 0;
                    }
                    return choiceEffects;
                }
            },
            {
                id: 'harsh_end',
                nameKey: 'modifier.harsh_end.name',
                descriptionKey: 'modifier.harsh_end.description',
                effect: (stats, choiceEffects, choiceNumber, totalChoices) => {
                    if (totalChoices - choiceNumber <= 5) {
                        for (const stat in choiceEffects) {
                            if (choiceEffects[stat] < 0) {
                                choiceEffects[stat] = Math.floor(choiceEffects[stat] * 1.3);
                            }
                        }
                    }
                    return choiceEffects;
                }
            }
        ];
    }

    /**
     * Выбрать случайный модификатор
     * @param {Array} unlockedModifiers - Разблокированные модификаторы
     * @returns {Object|null}
     */
    selectRandomModifier(unlockedModifiers = []) {
        // Всегда доступны базовые модификаторы
        const availableModifiers = this.allModifiers.filter(m => 
            !m.requiresUnlock || unlockedModifiers.includes(m.id)
        );
        
        if (availableModifiers.length === 0) {
            return null;
        }
        
        const randomIndex = Math.floor(Math.random() * availableModifiers.length);
        const modifier = { ...availableModifiers[randomIndex] };
        
        // Загружаем имя и описание из languageManager
        if (this.languageManager) {
            modifier.name = this.languageManager.getText(modifier.nameKey);
            modifier.description = this.languageManager.getText(modifier.descriptionKey);
        } else {
            // Fallback если languageManager не установлен
            modifier.name = modifier.nameKey || modifier.id;
            modifier.description = modifier.descriptionKey || '';
        }
        
        this.currentModifier = modifier;
        return modifier;
    }

    /**
     * Установить languageManager
     */
    setLanguageManager(languageManager) {
        this.languageManager = languageManager;
    }

    /**
     * Применить эффект модификатора
     * @param {Object} stats - Текущие статистики
     * @param {Object} choiceEffects - Эффекты выбора
     * @param {number} choiceNumber - Номер выбора
     * @param {number} totalChoices - Всего выборов
     * @returns {Object}
     */
    applyModifier(stats, choiceEffects, choiceNumber = 0, totalChoices = 0) {
        if (!this.currentModifier || !this.currentModifier.effect) {
            return choiceEffects;
        }
        
        return this.currentModifier.effect(stats, { ...choiceEffects }, choiceNumber, totalChoices);
    }

    /**
     * Получить текущий модификатор
     * @returns {Object|null}
     */
    getCurrentModifier() {
        return this.currentModifier;
    }

    /**
     * Сбросить модификатор
     */
    reset() {
        this.currentModifier = null;
    }
}

