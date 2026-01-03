/**
 * Менеджер сцен
 */
class SceneManager {
    constructor() {
        this.scenes = {
            easy: [],
            mid: [],
            hard: []
        };
        this.usedScenes = new Set();
        this.currentDifficulty = 'easy';
        this.loaded = false;
    }

    /**
     * Загрузить сцены из JSON файлов
     */
    async loadScenes() {
        try {
            const [easyData, midData, hardData] = await Promise.all([
                fetch('data/scenes_easy.json').then(r => r.json()),
                fetch('data/scenes_mid.json').then(r => r.json()),
                fetch('data/scenes_hard.json').then(r => r.json())
            ]);

            this.scenes.easy = easyData.scenes || [];
            this.scenes.mid = midData.scenes || [];
            this.scenes.hard = hardData.scenes || [];

            this.loaded = true;
            // Логирование только в dev режиме
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                console.log(`Загружено сцен: Easy=${this.scenes.easy.length}, Mid=${this.scenes.mid.length}, Hard=${this.scenes.hard.length}`);
            }
        } catch (error) {
            console.error('Ошибка загрузки сцен:', error);
            // Fallback на базовые сцены
            this.scenes.easy = this.getFallbackScenes('easy');
            this.scenes.mid = this.getFallbackScenes('mid');
            this.scenes.hard = this.getFallbackScenes('hard');
            this.loaded = true;
        }
    }

    /**
     * Получить случайную сцену с учетом сложности и использованных сцен
     * @param {number} choicesMade - Количество сделанных выборов
     * @param {Array} lowStats - Массив статистик с низкими значениями
     * @param {string} forcedDifficulty - Принудительная сложность (если задана)
     * @returns {Object|null}
     */
    getRandomScene(choicesMade = 0, lowStats = [], forcedDifficulty = null) {
        if (!this.loaded) {
            return null;
        }

        // Если задана принудительная сложность, используем её
        if (forcedDifficulty && ['easy', 'mid', 'hard'].includes(forcedDifficulty)) {
            this.currentDifficulty = forcedDifficulty;
        } else {
            // Определяем сложность на основе прогресса
            if (choicesMade < 10) {
                this.currentDifficulty = 'easy';
            } else if (choicesMade < 30) {
                this.currentDifficulty = 'mid';
            } else {
                this.currentDifficulty = 'hard';
            }
        }

        const availableScenes = this.scenes[this.currentDifficulty];
        if (availableScenes.length === 0) {
            return null;
        }

        // Если использовано больше 80% сцен, сбрасываем
        if (this.usedScenes.size > availableScenes.length * 0.8) {
            this.usedScenes.clear();
        }

        // Фильтруем неиспользованные сцены
        let candidates = availableScenes.filter(s => !this.usedScenes.has(s.id));

        // Если все использованы, используем все
        if (candidates.length === 0) {
            candidates = availableScenes;
            this.usedScenes.clear();
        }

        // Приоритет сценам, которые нацелены на низкие статистики
        if (lowStats.length > 0) {
            const targetedScenes = candidates.filter(scene => {
                return scene.choices.some(choice => {
                    return Object.keys(choice.effects || {}).some(stat => lowStats.includes(stat));
                });
            });

            if (targetedScenes.length > 0) {
                candidates = targetedScenes;
            }
        }

        // Выбираем случайную сцену
        const randomIndex = Math.floor(Math.random() * candidates.length);
        const selectedScene = candidates[randomIndex];

        this.usedScenes.add(selectedScene.id);

        return selectedScene;
    }

    /**
     * Сбросить использованные сцены
     */
    reset() {
        this.usedScenes.clear();
        this.currentDifficulty = 'easy';
    }

    /**
     * Базовые сцены на случай ошибки загрузки
     */
    getFallbackScenes(difficulty) {
        const baseScenes = [
            {
                id: 1,
                text: "Вы стоите перед выбором: помочь коллеге или сосредоточиться на своей работе.",
                choices: [
                    {
                        label: "Помочь коллеге",
                        effects: { heart: -3, time: -5 },
                        score: 5
                    },
                    {
                        label: "Сосредоточиться на работе",
                        effects: { drive: -4, heart: -2 },
                        score: 8
                    }
                ]
            }
        ];

        return baseScenes;
    }
}

