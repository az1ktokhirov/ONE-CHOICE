/**
 * ONE CHOICE: LIFE COLLAPSE
 * Основной игровой файл
 */

class Game {
    constructor() {
        // Детекция окружения - ПЕРВЫМ ДЕЛОМ
        this.environmentDetector = new EnvironmentDetector();
        
        // Инициализация менеджеров (languageManager создается первым для использования в других)
        this.languageManager = new LanguageManager();
        this.statsManager = new StatsManager();
        this.sceneManager = new SceneManager();
        this.adManager = new AdManager(this.environmentDetector);
        this.insightManager = new InsightManager();
        this.modifierManager = new ModifierManager(this.languageManager);
        this.endingsManager = new EndingsManager(this.languageManager);
        this.dailyRunManager = new DailyRunManager();
        this.quotesManager = new QuotesManager();
        
        // Флаг готовности UI
        this.uiReady = false;
        
        this.score = 0;
        this.choicesMade = 0;
        this.gameState = 'loading'; // loading, playing, gameover
        this.lastChoice = null;
        this.insightAlreadyAwarded = false; // Флаг для защиты от повторного начисления Insight
        this.soundEnabled = true;
        this.interstitialCounter = 0;
        this.audioContext = null;
        this.difficulty = 'normal'; // easy, normal, hard
        this.isDailyRun = false;
        this.playerStats = {
            totalRuns: 0,
            bestChoices: 0,
            failureStats: {},
            lastDifficulty: 'normal'
        };
        
        // Статистики и концовки теперь загружаются из languageManager

        this.init();
    }

    /**
     * Инициализация игры
     */
    async init() {
        try {
            // Фаза 1: Загрузка данных (без UI)
            this.languageManager.load();
            this.quotesManager.setLanguage(this.languageManager.getLanguage());
            
            // Фаза 2: Безопасная инициализация SDK (не блокирует)
            await this.safeInitializeSDK();

            // Фаза 3: Загрузка игровых данных
            await this.safeLoadScenes();

            // Фаза 4: Загрузка сохраненных данных
            this.loadSettings();
            this.loadDifficulty();
            this.loadPlayerStats();
            this.insightManager.load();
            this.endingsManager.load();
            this.dailyRunManager.load();

            // Фаза 5: Ожидание готовности DOM
            await this.waitForDOM();

            // Фаза 6: Настройка обработчиков (после создания DOM)
            this.setupEventListeners();
            this.setupMenuListeners();

            // Фаза 7: Подписка на события статистики
            this.statsManager.onStatChange((changes) => {
                this.safeUpdateStatBars(changes);
            });

            this.statsManager.onStatZero((zeroStat) => {
                this.handleGameOver(zeroStat);
            });

            // Фаза 8: Инициализация UI (после создания всех элементов)
            this.uiReady = true;
            this.initMenu();
            
            // Фаза 9: Обновление всех текстов (после готовности UI)
            this.safeUpdateAllTexts();
        } catch (error) {
            // Критическая ошибка - показываем базовое меню
            console.error('Критическая ошибка инициализации:', error);
            this.handleCriticalError();
        }
    }

    /**
     * Безопасная инициализация SDK
     */
    async safeInitializeSDK() {
        try {
            await this.adManager.initialize();
        } catch (error) {
            // Игнорируем ошибки SDK
        }
    }

    /**
     * Безопасная загрузка сцен
     */
    async safeLoadScenes() {
        try {
            await this.sceneManager.loadScenes();
        } catch (error) {
            console.error('Ошибка загрузки сцен:', error);
            // Игра продолжит работу с fallback сценами
        }
    }

    /**
     * Ожидание готовности DOM
     */
    async waitForDOM() {
        return new Promise((resolve) => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve);
            } else {
                resolve();
            }
        });
    }

    /**
     * Обработка критической ошибки
     */
    handleCriticalError() {
        // Показываем базовое меню даже при ошибке
        const menu = document.getElementById('main-menu');
        if (menu) {
            menu.classList.remove('hidden');
        }
    }

    /**
     * Настройка обработчиков событий
     */
    setupEventListeners() {
        // Кнопки выбора
        document.getElementById('choice-1').addEventListener('click', () => {
            this.makeChoice(0);
        });

        document.getElementById('choice-2').addEventListener('click', () => {
            this.makeChoice(1);
        });

        // Кнопки на экране окончания
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.showInterstitialIfNeeded();
            this.returnToMenu();
        });

        document.getElementById('revive-ad-btn').addEventListener('click', () => {
            this.showReviveAd();
        });

        // Звук в игре
        const soundToggle = document.getElementById('sound-toggle');
        if (soundToggle) {
            soundToggle.addEventListener('click', () => {
                this.toggleSound();
            });
        }

        // Пауза при потере фокуса (для Yandex Games)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.gameState === 'playing') {
                // Игра автоматически паузится через отсутствие взаимодействия
            }
        });
    }

    /**
     * Настройка обработчиков меню
     */
    setupMenuListeners() {
        // Кнопка "НАЧАТЬ"
        document.getElementById('start-btn').addEventListener('click', () => {
            this.startGameFromMenu();
        });

        // Кнопка "Сложность"
        document.getElementById('difficulty-btn').addEventListener('click', () => {
            this.showDifficultyScreen();
        });

        // Кнопка "Статистика"
        document.getElementById('stats-btn').addEventListener('click', () => {
            this.showStatsScreen();
        });

        // Кнопка "Звук" в меню
        document.getElementById('sound-menu-btn').addEventListener('click', () => {
            this.toggleSound();
        });

        // Кнопка "Назад" в экране сложности
        document.getElementById('difficulty-back-btn').addEventListener('click', () => {
            this.hideDifficultyScreen();
        });

        // Кнопка "Назад" в экране статистики
        document.getElementById('stats-back-btn').addEventListener('click', () => {
            this.hideStatsScreen();
        });

        // Выбор сложности
        document.querySelectorAll('.difficulty-option').forEach(btn => {
            btn.addEventListener('click', () => {
                const difficulty = btn.dataset.difficulty;
                this.selectDifficulty(difficulty);
            });
        });

        // Кнопка "Концовки"
        document.getElementById('endings-btn').addEventListener('click', () => {
            this.showEndingsScreen();
        });

        // Кнопка "Язык"
        document.getElementById('language-btn').addEventListener('click', () => {
            this.showLanguageScreen();
        });

        // Кнопка "Назад" в экране концовок
        document.getElementById('endings-back-btn').addEventListener('click', () => {
            this.hideEndingsScreen();
        });

        // Кнопка "Назад" в экране языка
        document.getElementById('language-back-btn').addEventListener('click', () => {
            this.hideLanguageScreen();
        });

        // Выбор языка
        document.querySelectorAll('.language-option').forEach(btn => {
            btn.addEventListener('click', () => {
                const language = btn.dataset.language;
                this.selectLanguage(language);
            });
        });

        // Кнопка продолжения модификатора
        document.getElementById('modifier-continue-btn').addEventListener('click', () => {
            this.hideModifierAnnouncement();
        });
    }

    /**
     * Инициализация меню
     */
    initMenu() {
        // Показываем случайную фразу на фоне
        this.updateBackgroundPhrase();
        
        // Обновляем информацию для возвращающихся игроков
        this.updateReturningPlayerInfo();
        
        // Обновляем статус звука в меню
        this.updateSoundStatus();
        
        // Показываем меню
        document.getElementById('main-menu').classList.remove('hidden');
    }

    /**
     * Обновить фоновую фразу
     */
    updateBackgroundPhrase() {
        const phraseEl = document.getElementById('background-phrase');
        if (phraseEl) {
            const randomPhrase = this.quotesManager.getQuote('menu');
            phraseEl.textContent = randomPhrase;
            
            // Случайная позиция
            const x = Math.random() * 80 + 10;
            const y = Math.random() * 80 + 10;
            phraseEl.style.left = `${x}%`;
            phraseEl.style.top = `${y}%`;
        }
    }

    /**
     * Безопасное обновление всех текстов на выбранном языке
     */
    safeUpdateAllTexts() {
        if (!this.uiReady) {
            return;
        }

        try {
            const lang = this.languageManager;
            
            // Безопасное обновление элементов меню
            this.safeSetText('start-btn', lang.getText('menu.start'));
            this.safeSetText('difficulty-btn-text', lang.getText('menu.difficulty'));
            this.safeSetText('stats-btn-text', lang.getText('menu.stats'));
            this.safeSetText('endings-btn-text', lang.getText('menu.endings'));
            this.safeSetText('sound-btn-text', lang.getText('menu.sound'));
            this.safeSetText('language-btn-text', lang.getText('menu.language'));
            this.safeSetText('menu-subtitle', lang.getText('menu.tagline'));
            
            // Обновляем все элементы с data-text атрибутом
            document.querySelectorAll('[data-text]').forEach(el => {
                try {
                    const textKey = el.getAttribute('data-text');
                    if (textKey) {
                        const text = lang.getText(textKey.toLowerCase().replace(/\s+/g, '.'));
                        if (text !== textKey) {
                            el.textContent = text;
                        }
                    }
                } catch (e) {
                    // Игнорируем ошибки отдельных элементов
                }
            });
            
            // Обновляем Insight (безопасно)
            this.safeUpdateInsightDisplay();
            
            // Обновляем ежедневный баннер (безопасно)
            this.safeUpdateDailyBanner();
        } catch (error) {
            // Игнорируем ошибки обновления текстов
        }
    }

    /**
     * Безопасная установка текста элемента
     */
    safeSetText(elementId, text) {
        try {
            const el = document.getElementById(elementId);
            if (el) {
                el.textContent = text;
            }
        } catch (e) {
            // Игнорируем ошибки
        }
    }

    /**
     * Обновить информацию для возвращающихся игроков
     */
    updateReturningPlayerInfo() {
        try {
            const infoEl = document.getElementById('returning-player-info');
            if (!infoEl) return;
            
            if (this.playerStats.totalRuns > 0) {
                const lang = this.languageManager;
                const best = this.playerStats.bestChoices;
                const commonFailure = this.getMostCommonFailure();
                const bestText = lang.getText('stats.bestResult');
                const commonText = lang.getText('stats.commonFailure');
                const decisionsText = lang.getText('game.decisions').toLowerCase();
                infoEl.textContent = `${bestText} ${best} ${decisionsText}. ${commonText} ${commonFailure}.`;
                infoEl.classList.remove('hidden');
            } else {
                infoEl.classList.add('hidden');
            }
        } catch (e) {
            // Игнорируем ошибки
        }
    }

    /**
     * Получить наиболее частую причину провала
     */
    getMostCommonFailure() {
        const failures = this.playerStats.failureStats;
        if (Object.keys(failures).length === 0) return '—';
        
        let maxCount = 0;
        let mostCommon = '—';
        
        for (const [stat, count] of Object.entries(failures)) {
            if (count > maxCount) {
                maxCount = count;
                mostCommon = this.languageManager.getText(`stats.${stat}`) || stat;
            }
        }
        
        return mostCommon;
    }

    /**
     * Показать экран выбора сложности
     */
    showDifficultyScreen() {
        document.getElementById('main-menu').classList.add('hidden');
        document.getElementById('difficulty-screen').classList.remove('hidden');
        this.updateDifficultySelection();
    }

    /**
     * Скрыть экран выбора сложности
     */
    hideDifficultyScreen() {
        document.getElementById('difficulty-screen').classList.add('hidden');
        document.getElementById('main-menu').classList.remove('hidden');
    }

    /**
     * Обновить визуальное выделение выбранной сложности
     */
    updateDifficultySelection() {
        document.querySelectorAll('.difficulty-option').forEach(btn => {
            if (btn.dataset.difficulty === this.difficulty) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    /**
     * Выбрать сложность
     */
    selectDifficulty(difficulty) {
        this.difficulty = difficulty;
        this.updateDifficultySelection();
        this.saveDifficulty();
    }

    /**
     * Показать экран статистики
     */
    showStatsScreen() {
        try {
            document.getElementById('main-menu').classList.add('hidden');
            document.getElementById('stats-screen').classList.remove('hidden');
            this.updateStatsDisplay();
        } catch (e) {
            // Игнорируем ошибки
        }
    }

    /**
     * Скрыть экран статистики
     */
    hideStatsScreen() {
        try {
            document.getElementById('stats-screen').classList.add('hidden');
            document.getElementById('main-menu').classList.remove('hidden');
        } catch (e) {
            // Игнорируем ошибки
        }
    }

    /**
     * Показать экран выбора языка
     */
    showLanguageScreen() {
        try {
            document.getElementById('main-menu').classList.add('hidden');
            document.getElementById('language-screen').classList.remove('hidden');
            this.updateLanguageSelection();
        } catch (e) {
            // Игнорируем ошибки
        }
    }

    /**
     * Скрыть экран выбора языка
     */
    hideLanguageScreen() {
        try {
            document.getElementById('language-screen').classList.add('hidden');
            document.getElementById('main-menu').classList.remove('hidden');
        } catch (e) {
            // Игнорируем ошибки
        }
    }

    /**
     * Обновить визуальное выделение выбранного языка
     */
    updateLanguageSelection() {
        try {
            document.querySelectorAll('.language-option').forEach(btn => {
                if (btn.dataset.language === this.languageManager.getLanguage()) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        } catch (e) {
            // Игнорируем ошибки
        }
    }

    /**
     * Выбрать язык
     */
    selectLanguage(language) {
        try {
            this.languageManager.setLanguage(language);
            this.quotesManager.setLanguage(language);
            this.endingsManager.setLanguageManager(this.languageManager);
            this.modifierManager.setLanguageManager(this.languageManager);
            this.updateLanguageSelection();
            this.safeUpdateAllTexts();
            
            // Обновляем экраны если они открыты
            if (!document.getElementById('stats-screen').classList.contains('hidden')) {
                this.updateStatsDisplay();
            }
            if (!document.getElementById('endings-screen').classList.contains('hidden')) {
                this.updateEndingsDisplay();
            }
        } catch (e) {
            // Игнорируем ошибки смены языка
        }
    }

    /**
     * Обновить отображение статистики
     */
    updateStatsDisplay() {
        try {
            const lang = this.languageManager;
            
            document.getElementById('total-runs').textContent = this.playerStats.totalRuns;
            document.getElementById('best-result').textContent = 
                this.playerStats.bestChoices > 0 ? `${this.playerStats.bestChoices} ${lang.getText('game.decisions').toLowerCase()}` : '—';
            document.getElementById('common-failure').textContent = this.getMostCommonFailure();
            
            const difficultyNames = {
                easy: lang.getText('difficulty.easy'),
                normal: lang.getText('difficulty.normal'),
                hard: lang.getText('difficulty.hard')
            };
            document.getElementById('last-difficulty').textContent = difficultyNames[this.difficulty] || lang.getText('difficulty.normal');
            document.getElementById('unlocked-endings-count').textContent = this.endingsManager.getUnlockedCount();
        } catch (e) {
            // Игнорируем ошибки
        }
    }

    /**
     * Показать экран концовок
     */
    showEndingsScreen() {
        try {
            // Lock body scroll
            this.lockBodyScroll();
            
            document.getElementById('main-menu').classList.add('hidden');
            document.getElementById('endings-screen').classList.remove('hidden');
            
            // Reset scroll position to top
            const listContainer = document.getElementById('endings-list-container');
            if (listContainer) {
                listContainer.scrollTop = 0;
            }
            
            this.updateEndingsDisplay();
        } catch (e) {
            // Игнорируем ошибки
        }
    }

    /**
     * Скрыть экран концовок
     */
    hideEndingsScreen() {
        try {
            // Unlock body scroll
            this.unlockBodyScroll();
            
            document.getElementById('endings-screen').classList.add('hidden');
            document.getElementById('main-menu').classList.remove('hidden');
        } catch (e) {
            // Игнорируем ошибки
        }
    }

    /**
     * Заблокировать скролл body (но оставить скролл в endings-list-container)
     */
    lockBodyScroll() {
        try {
            const body = document.body;
            const scrollY = window.scrollY || window.pageYOffset;
            
            // Сохраняем текущую позицию скролла
            body.style.position = 'fixed';
            body.style.top = `-${scrollY}px`;
            body.style.width = '100%';
            body.style.overflow = 'hidden';
            
            // Сохраняем позицию для восстановления
            body.dataset.scrollY = scrollY.toString();
        } catch (e) {
            // Игнорируем ошибки
        }
    }

    /**
     * Разблокировать скролл body
     */
    unlockBodyScroll() {
        try {
            const body = document.body;
            const scrollY = body.dataset.scrollY || '0';
            
            // Восстанавливаем позицию скролла
            body.style.position = '';
            body.style.top = '';
            body.style.width = '';
            body.style.overflow = '';
            
            // Восстанавливаем позицию скролла
            if (scrollY) {
                window.scrollTo(0, parseInt(scrollY, 10));
            }
            
            // Удаляем временные данные
            delete body.dataset.scrollY;
        } catch (e) {
            // Игнорируем ошибки
        }
    }

    /**
     * Обновить отображение концовок
     */
    updateEndingsDisplay() {
        try {
            const endingsList = document.getElementById('endings-list');
            if (!endingsList) return;
            
            endingsList.innerHTML = '';
            
            const allEndings = this.endingsManager.getAllEndings();
            const lang = this.languageManager;
            
            allEndings.forEach(ending => {
                const endingEl = document.createElement('div');
                endingEl.className = `ending-item ${ending.unlocked ? 'unlocked' : 'locked'}`;
                
                if (ending.unlocked) {
                    endingEl.innerHTML = `
                        <div class="ending-title">${ending.title}</div>
                        <div class="ending-description">${ending.description}</div>
                    `;
                } else {
                    endingEl.innerHTML = `
                        <div class="ending-title">${lang.getText('endings.locked')}</div>
                        <div class="ending-description">—</div>
                    `;
                }
                
                endingsList.appendChild(endingEl);
            });
        } catch (e) {
            // Игнорируем ошибки
        }
    }

    /**
     * Запустить игру из меню
     */
    startGameFromMenu() {
        // Проверяем ежедневный запуск
        const dailyData = this.dailyRunManager.startDailyRun();
        this.isDailyRun = dailyData !== null;
        
        // Выбираем случайный модификатор
        const unlockedModifiers = this.insightManager.getUnlockedModifiers();
        const modifier = this.modifierManager.selectRandomModifier(unlockedModifiers);
        
        // Если есть модификатор, показываем его
        if (modifier) {
            document.getElementById('main-menu').classList.add('hidden');
            this.showModifierAnnouncement(modifier);
            return;
        }
        
        // Проверяем, первый ли это запуск
        const isFirstTime = this.playerStats.totalRuns === 0;
        
        if (isFirstTime) {
            // Показываем сообщение для первого запуска
            document.getElementById('main-menu').classList.add('hidden');
            const quote = this.quotesManager.getQuote('preGame');
            document.getElementById('first-time-quote').textContent = quote;
            document.getElementById('first-time-message').classList.remove('hidden');
            
            setTimeout(() => {
                document.getElementById('first-time-message').classList.add('hidden');
                this.startNewGame();
            }, 2000);
        } else {
            // Сразу начинаем игру
            document.getElementById('main-menu').classList.add('hidden');
            this.startNewGame();
        }
    }

    /**
     * Показать объявление модификатора
     */
    showModifierAnnouncement(modifier) {
        document.getElementById('modifier-name').textContent = modifier.name;
        document.getElementById('modifier-description').textContent = modifier.description;
        document.getElementById('modifier-announcement').classList.remove('hidden');
    }

    /**
     * Скрыть объявление модификатора
     */
    hideModifierAnnouncement() {
        document.getElementById('modifier-announcement').classList.add('hidden');
        
        // Проверяем, первый ли это запуск
        const isFirstTime = this.playerStats.totalRuns === 0;
        
        if (isFirstTime) {
            const quote = this.quotesManager.getQuote('preGame');
            document.getElementById('first-time-quote').textContent = quote;
            document.getElementById('first-time-message').classList.remove('hidden');
            
            setTimeout(() => {
                document.getElementById('first-time-message').classList.add('hidden');
                this.startNewGame();
            }, 2000);
        } else {
            this.startNewGame();
        }
    }

    /**
     * Вернуться в меню
     */
    returnToMenu() {
        try {
            const gameOverScreen = document.getElementById('game-over-screen');
            const gameContainer = document.getElementById('game-container');
            const mainMenu = document.getElementById('main-menu');
            const insightEarned = document.getElementById('insight-earned');
            
            if (gameOverScreen) gameOverScreen.classList.add('hidden');
            if (gameContainer) gameContainer.classList.add('hidden');
            if (mainMenu) mainMenu.classList.remove('hidden');
            if (insightEarned) insightEarned.classList.add('hidden');
            
            this.updateReturningPlayerInfo();
            this.updateBackgroundPhrase();
            this.safeUpdateInsightDisplay();
            this.safeUpdateDailyBanner();
        } catch (e) {
            // Игнорируем ошибки
        }
    }

    /**
     * Начать новую игру
     */
    startNewGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.choicesMade = 0;
        this.lastChoice = null;
        this.insightAlreadyAwarded = false; // Сбрасываем флаг для нового запуска
        
        this.statsManager.reset();
        this.sceneManager.reset();
        this.modifierManager.reset();
        
        // Сбрасываем использованные цитаты для новой игры
        this.quotesManager.reset();
        
        // Применяем выбранную сложность
        this.applyDifficulty();
        
        // Применяем постоянные бонусы Insight
        const baseStats = this.statsManager.getAll();
        const modifiedStats = this.insightManager.applyPermanentBonuses(baseStats);
        for (const [stat, value] of Object.entries(modifiedStats)) {
            this.statsManager.stats[stat] = value;
        }
        
        // Всегда выбираем новый модификатор для нового запуска
        const unlockedModifiers = this.insightManager.getUnlockedModifiers();
        this.modifierManager.selectRandomModifier(unlockedModifiers);
        
        this.updateStatBars();
        this.updateUI();
        this.showNextScene();
        
        document.getElementById('game-over-screen').classList.add('hidden');
        document.getElementById('game-container').classList.remove('hidden');
    }

    /**
     * Применить выбранную сложность
     */
    applyDifficulty() {
        // Сложность влияет на выбор сцен и их эффекты
        // В sceneManager уже есть логика выбора сложности на основе choicesMade
        // Здесь можно добавить дополнительные модификаторы
        this.sceneManager.currentDifficulty = this.difficulty === 'easy' ? 'easy' : 
                                               this.difficulty === 'hard' ? 'hard' : 'mid';
    }

    /**
     * Показать следующую сцену
     */
    showNextScene() {
        const lowStats = this.statsManager.getStatsBelow(30);
        // Передаем выбранную сложность с учетом прогресса
        let forcedDifficulty = null;
        
        // Применяем выбранную сложность с учетом прогресса
        if (this.difficulty === 'easy') {
            // Легкий режим: дольше остаемся на легких сценах
            if (this.choicesMade < 15) {
                forcedDifficulty = 'easy';
            } else if (this.choicesMade < 25) {
                forcedDifficulty = 'mid';
            } else {
                forcedDifficulty = 'hard';
            }
        } else if (this.difficulty === 'hard') {
            // Жесткий режим: быстрее переходим к сложным сценам
            if (this.choicesMade < 5) {
                forcedDifficulty = 'mid';
            } else {
                forcedDifficulty = 'hard';
            }
        } else {
            // Нормальный режим: стандартная прогрессия
            if (this.choicesMade < 10) {
                forcedDifficulty = 'easy';
            } else if (this.choicesMade < 30) {
                forcedDifficulty = 'mid';
            } else {
                forcedDifficulty = 'hard';
            }
        }
        
        const scene = this.sceneManager.getRandomScene(this.choicesMade, lowStats, forcedDifficulty);

        if (!scene) {
            console.error('Не удалось загрузить сцену');
            return;
        }

        // Обновляем текст ситуации
        const situationEl = document.getElementById('situation-text');
        situationEl.textContent = scene.text;
        situationEl.classList.add('fade-in');
        setTimeout(() => situationEl.classList.remove('fade-in'), 300);

        // Обновляем кнопки выбора
        const choice1 = document.getElementById('choice-1');
        const choice2 = document.getElementById('choice-2');

        choice1.textContent = scene.choices[0].label;
        choice2.textContent = scene.choices[1].label;

        // Сохраняем текущую сцену для возможного отката
        this.currentScene = scene;
    }

    /**
     * Сделать выбор
     * @param {number} choiceIndex - Индекс выбора (0 или 1)
     */
    makeChoice(choiceIndex) {
        if (this.gameState !== 'playing' || !this.currentScene) {
            return;
        }

        const choice = this.currentScene.choices[choiceIndex];
        
        // Применяем модификатор к эффектам
        let modifiedEffects = { ...(choice.effects || {}) };
        const currentStats = this.statsManager.getAll();
        // Для harsh_end используем текущее количество выборов как приближение
        // (так как мы не знаем точное количество заранее, используем текущее + 10 как оценку)
        const estimatedTotalChoices = this.choicesMade + 10;
        modifiedEffects = this.modifierManager.applyModifier(
            currentStats, 
            modifiedEffects, 
            this.choicesMade + 1,
            estimatedTotalChoices
        );
        
        // Применяем эффекты
        const result = this.statsManager.applyEffects(modifiedEffects, choice.score || 0);
        
        // Обновляем счет
        this.score += choice.score || 0;
        this.choicesMade++;
        
        // Сохраняем последний выбор для отката
        this.lastChoice = {
            choiceIndex,
            scene: this.currentScene,
            effects: choice.effects,
            score: choice.score
        };

        // Обновляем UI
        this.updateUI();

        // Сохраняем прогресс
        this.saveGame();

        // Звуковой эффект
        if (this.soundEnabled) {
            this.playSound('click');
        }

        // Если игра не закончилась, показываем следующую сцену
        if (!result.anyStatZero) {
            setTimeout(() => {
                this.showNextScene();
            }, 500);
        }
    }

    /**
     * Безопасное обновление полос статистики
     * @param {Object} changes - Изменения статистики
     */
    safeUpdateStatBars(changes = null) {
        if (!this.uiReady) return;
        
        try {
            const stats = this.statsManager.getAll();

            for (const [stat, value] of Object.entries(stats)) {
                try {
                    const fillEl = document.getElementById(`stat-${stat}`);
                    const valueEl = document.getElementById(`value-${stat}`);

                    if (fillEl && valueEl) {
                        fillEl.style.width = `${value}%`;
                        fillEl.setAttribute('data-stat', stat);
                        valueEl.textContent = Math.round(value);

                        // Визуальные эффекты для низких значений
                        fillEl.classList.remove('low', 'critical');
                        if (value <= 20) {
                            fillEl.classList.add('critical');
                        } else if (value <= 40) {
                            fillEl.classList.add('low');
                        }

                        // Анимация изменения
                        if (changes && changes[stat]) {
                            fillEl.classList.add('stat-change');
                            setTimeout(() => {
                                if (fillEl) {
                                    fillEl.classList.remove('stat-change');
                                }
                            }, 500);
                        }
                    }
                } catch (e) {
                    // Игнорируем ошибки отдельных элементов
                }
            }
        } catch (e) {
            // Игнорируем общие ошибки
        }
    }

    /**
     * Обновить полосы статистики (публичный метод для совместимости)
     * @param {Object} changes - Изменения статистики
     */
    updateStatBars(changes = null) {
        this.safeUpdateStatBars(changes);
    }

    /**
     * Обновить UI
     */
    updateUI() {
        const lang = this.languageManager;
        const decisionsText = lang.getText('game.decisions');
        const scoreText = lang.getText('game.score');
        document.getElementById('choices-count').textContent = `${decisionsText} ${this.choicesMade}`;
        document.getElementById('score-display').textContent = `${scoreText} ${this.score}`;
    }

    /**
     * Обработка окончания игры
     * @param {string} zeroStat - Статистика, достигшая нуля
     */
    handleGameOver(zeroStat) {
        if (this.gameState === 'gameover') {
            return;
        }

        this.gameState = 'gameover';

        // Защита от повторного начисления Insight
        if (this.insightAlreadyAwarded) {
            return;
        }
        this.insightAlreadyAwarded = true;

        // Получаем финальные статистики
        const finalStats = this.statsManager.getAll();

        // Проверяем и разблокируем концовки
        this.endingsManager.checkAndUnlockEndings(zeroStat, finalStats);

        // Вычисляем и добавляем Insight (только один раз)
        const insightEarned = this.insightManager.calculateInsight(this.choicesMade, this.difficulty);
        this.insightManager.addInsight(insightEarned);

        // Обновляем статистику игрока
        this.updatePlayerStats(zeroStat);

        // Если это ежедневный запуск, отмечаем как завершенный
        if (this.isDailyRun) {
            this.dailyRunManager.completeDailyRun();
        }

        // Звуковой эффект
        if (this.soundEnabled) {
            this.playSound('collapse');
        }

        // Определяем тип окончания из languageManager
        const endingKey = `endings.${zeroStat}`;
        const ending = {
            title: this.languageManager.getText(`${endingKey}.title`),
            description: this.languageManager.getText(`${endingKey}.description`)
        };
        
        // Fallback на mind если нет перевода
        if (ending.title === endingKey + '.title') {
            ending.title = this.languageManager.getText('endings.mind.title');
            ending.description = this.languageManager.getText('endings.mind.description');
        }

        // Обновляем экран окончания
        const lang = this.languageManager;
        document.getElementById('collapse-reason').textContent = ending.description;
        document.getElementById('ending-type').textContent = ending.title;
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('final-choices').textContent = this.choicesMade;
        
        // Обновляем метки на выбранном языке
        this.safeSetText('final-score-label', lang.getText('game.score'));
        this.safeSetText('final-choices-label', lang.getText('game.decisions'));
        this.safeSetText('percentile-label', lang.getText('game.survived'));
        
        // Показываем полученный Insight
        const insightEarnedEl = document.getElementById('insight-earned-value');
        const insightEarnedLabel = document.getElementById('insight-earned-label');
        if (insightEarnedEl) {
            insightEarnedEl.textContent = insightEarned;
        }
        if (insightEarnedLabel) {
            insightEarnedLabel.textContent = this.languageManager.getText('insight.earned');
        }
        const insightEarnedContainer = document.getElementById('insight-earned');
        if (insightEarnedContainer) {
            insightEarnedContainer.classList.remove('hidden');
        }
        
        // Показываем цитату для перезапуска
        const restartQuote = this.quotesManager.getQuote('restart');
        document.getElementById('restart-quote').textContent = restartQuote;
        
        // Генерируем процентиль (псевдослучайный, но убедительный)
        const percentile = this.calculatePercentile();
        const percentileText = this.languageManager.getText('game.percentile');
        document.getElementById('percentile').textContent = `${percentile}% ${percentileText}`;

        // Показываем экран окончания
        setTimeout(() => {
            document.getElementById('game-over-screen').classList.remove('hidden');
            document.getElementById('game-container').classList.add('hidden');
        }, 1000);
    }

    /**
     * Обновить статистику игрока
     */
    updatePlayerStats(zeroStat) {
        this.playerStats.totalRuns++;
        
        if (this.choicesMade > this.playerStats.bestChoices) {
            this.playerStats.bestChoices = this.choicesMade;
        }
        
        if (!this.playerStats.failureStats[zeroStat]) {
            this.playerStats.failureStats[zeroStat] = 0;
        }
        this.playerStats.failureStats[zeroStat]++;
        
        this.playerStats.lastDifficulty = this.difficulty;
        
        this.savePlayerStats();
    }

    /**
     * Вычислить процентиль (псевдослучайный)
     * @returns {number}
     */
    calculatePercentile() {
        // Базовый процентиль на основе количества выборов и счета
        const basePercentile = Math.min(95, Math.max(5, 
            Math.floor((this.choicesMade * 2 + this.score / 10) * 1.5)
        ));
        
        // Добавляем небольшую случайность для убедительности
        const variation = Math.floor(Math.random() * 10) - 5;
        return Math.max(1, Math.min(99, basePercentile + variation));
    }

    /**
     * Показать рекламу для восстановления
     */
    async showReviveAd() {
        const success = await this.adManager.showRewardedAd('revive');
        
        if (success) {
            const lowestStat = this.statsManager.getLowestStat();
            if (lowestStat) {
                this.statsManager.revive(lowestStat);
                this.updateStatBars();
                
                // Продолжаем игру
                this.gameState = 'playing';
                document.getElementById('game-over-screen').classList.add('hidden');
                document.getElementById('game-container').classList.remove('hidden');
                this.showNextScene();
            }
        }
    }

    /**
     * Показать межстраничную рекламу при необходимости
     */
    showInterstitialIfNeeded() {
        this.interstitialCounter++;
        if (this.interstitialCounter >= 3) {
            this.adManager.showInterstitialAd();
            this.interstitialCounter = 0;
        }
    }

    /**
     * Переключить звук
     */
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        const btn = document.getElementById('sound-toggle');
        if (btn) {
            btn.textContent = this.soundEnabled ? '🔊' : '🔇';
        }
        this.updateSoundStatus();
        this.saveSettings();
    }

    /**
     * Обновить статус звука в меню
     */
    updateSoundStatus() {
        const soundStatus = document.getElementById('sound-status');
        if (soundStatus) {
            const lang = this.languageManager;
            soundStatus.textContent = this.soundEnabled ? lang.getText('menu.soundOn') : lang.getText('menu.soundOff');
        }
    }

    /**
     * Сохранить настройки в localStorage
     */
    saveSettings() {
        try {
            localStorage.setItem('onechoice_settings', JSON.stringify({
                soundEnabled: this.soundEnabled
            }));
        } catch (error) {
            console.warn('Не удалось сохранить настройки:', error);
        }
    }

    /**
     * Загрузить настройки из localStorage
     */
    loadSettings() {
        try {
            const saved = localStorage.getItem('onechoice_settings');
            if (saved) {
                const settings = JSON.parse(saved);
                this.soundEnabled = settings.soundEnabled !== undefined ? settings.soundEnabled : true;
            }
        } catch (error) {
            console.warn('Не удалось загрузить настройки:', error);
        }
    }

    /**
     * Сохранить выбранную сложность
     */
    saveDifficulty() {
        try {
            localStorage.setItem('onechoice_difficulty', this.difficulty);
        } catch (error) {
            console.warn('Не удалось сохранить сложность:', error);
        }
    }

    /**
     * Загрузить выбранную сложность
     */
    loadDifficulty() {
        try {
            const saved = localStorage.getItem('onechoice_difficulty');
            if (saved && ['easy', 'normal', 'hard'].includes(saved)) {
                this.difficulty = saved;
            }
        } catch (error) {
            console.warn('Не удалось загрузить сложность:', error);
        }
    }

    /**
     * Сохранить статистику игрока
     */
    savePlayerStats() {
        try {
            localStorage.setItem('onechoice_player_stats', JSON.stringify(this.playerStats));
        } catch (error) {
            console.warn('Не удалось сохранить статистику:', error);
        }
    }

    /**
     * Загрузить статистику игрока
     */
    loadPlayerStats() {
        try {
            const saved = localStorage.getItem('onechoice_player_stats');
            if (saved) {
                this.playerStats = { ...this.playerStats, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.warn('Не удалось загрузить статистику:', error);
        }
    }

    /**
     * Сохранить прогресс игры
     */
    saveGame() {
        try {
            const gameData = {
                stats: this.statsManager.getAll(),
                score: this.score,
                choicesMade: this.choicesMade,
                timestamp: Date.now()
            };
            localStorage.setItem('onechoice_save', JSON.stringify(gameData));
        } catch (error) {
            console.warn('Не удалось сохранить игру:', error);
        }
    }

    /**
     * Загрузить сохраненный прогресс
     */
    loadGame() {
        try {
            const saved = localStorage.getItem('onechoice_save');
            if (saved) {
                const gameData = JSON.parse(saved);
                // Проверяем, не устарело ли сохранение (старше 24 часов)
                const hoursSinceSave = (Date.now() - gameData.timestamp) / (1000 * 60 * 60);
                if (hoursSinceSave < 24) {
                    // Можно добавить функцию загрузки сохранения, если нужно
                    return gameData;
                }
            }
        } catch (error) {
            console.warn('Не удалось загрузить игру:', error);
        }
        return null;
    }

    /**
     * Воспроизвести звук
     * @param {string} type - Тип звука: 'click', 'collapse', 'ambient'
     */
    playSound(type) {
        if (!this.soundEnabled) return;

        try {
            const audioContext = this.audioContext || (this.audioContext = new (window.AudioContext || window.webkitAudioContext)());
            
            let frequency, duration, type_wave;
            
            switch(type) {
                case 'click':
                    frequency = 800;
                    duration = 0.1;
                    type_wave = 'sine';
                    break;
                case 'collapse':
                    frequency = 150;
                    duration = 0.5;
                    type_wave = 'sawtooth';
                    break;
                case 'ambient':
                    // Фоновый звук не реализован здесь, можно добавить отдельно
                    return;
                default:
                    frequency = 600;
                    duration = 0.15;
                    type_wave = 'sine';
            }

            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = frequency;
            oscillator.type = type_wave;

            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        } catch (error) {
            console.log(`[Sound] ${type} (fallback)`);
        }
    }
}

// Глобальная обработка ошибок промисов
window.addEventListener('unhandledrejection', (event) => {
    // Игнорируем ошибки от расширений браузера и SDK
    const errorMessage = event.reason?.message || event.reason?.toString() || '';
    const errorStack = event.reason?.stack || '';
    
    // Фильтруем ошибки от расширений браузера (включая VM скрипты)
    if (errorMessage.includes('csspeeper') || 
        errorMessage.includes('inspector') ||
        errorMessage.includes('payload') ||
        errorMessage.includes('Permissions policy') ||
        errorMessage.includes('unload') ||
        errorMessage.includes('beforeunload') ||
        errorStack.includes('csspeeper') ||
        errorStack.includes('inspector') ||
        errorStack.includes('VM') ||
        errorMessage.includes('postMessage') ||
        errorMessage.includes('parent') ||
        errorMessage.includes('YaGames')) {
        event.preventDefault();
        return;
    }
    
    // Логируем только критические ошибки в dev режиме
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.warn('Необработанная ошибка промиса:', event.reason);
    }
    event.preventDefault();
});

// Глобальная обработка ошибок
window.addEventListener('error', (event) => {
    const errorMessage = event.message || '';
    const errorSource = event.filename || '';
    const errorStack = event.error?.stack || '';
    
    // Фильтруем ошибки от расширений браузера и SDK (включая VM скрипты)
    const shouldIgnore = errorMessage.includes('csspeeper') ||
        errorMessage.includes('inspector') ||
        errorMessage.includes('inspector.b9415ea5') ||
        errorMessage.includes('payload') ||
        errorMessage.includes('Permissions policy') ||
        errorMessage.includes('unload') ||
        errorMessage.includes('beforeunload') ||
        errorSource.includes('csspeeper') ||
        errorSource.includes('inspector') ||
        errorSource.includes('VM') ||
        errorStack.includes('csspeeper') ||
        errorStack.includes('inspector') ||
        errorStack.includes('inspector.b9415ea5') ||
        errorStack.includes('VM') ||
        errorMessage.includes('postMessage') ||
        errorMessage.includes('parent') ||
        errorMessage.includes('YaGames') ||
        errorMessage.includes('[Violation]');
    
    if (shouldIgnore) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return false;
    }
    
    // Логируем только критические ошибки в dev режиме
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        if (event.error && event.error.message) {
            console.error('Критическая ошибка:', event.error);
        }
    }
    
    // Предотвращаем показ ошибки в консоли для платформенных ошибок
    if (event.error && (
        event.error.message.includes('postMessage') ||
        event.error.message.includes('parent') ||
        event.error.message.includes('YaGames') ||
        event.error.message.includes('Permissions policy') ||
        event.error.message.includes('unload') ||
        event.error.message.includes('beforeunload')
    )) {
        event.preventDefault();
        event.stopPropagation();
        return false;
    }
    
    return true;
}, true); // Используем capture phase для перехвата всех ошибок

// Инициализация игры при загрузке страницы
let game;
window.addEventListener('DOMContentLoaded', () => {
    try {
        game = new Game();
    } catch (error) {
        console.error('Ошибка инициализации игры:', error);
        // Показываем базовое меню даже при ошибке
        const menu = document.getElementById('main-menu');
        if (menu) {
            menu.classList.remove('hidden');
        }
    }
});

