/**
 * Менеджер языков
 */
class LanguageManager {
    constructor() {
        this.currentLanguage = 'ru';
        this.texts = {
            ru: {
                // UI
                menu: {
                    title: "ONE CHOICE",
                    subtitle: "LIFE COLLAPSE",
                    tagline: "Каждое решение что-то ломает.",
                    start: "НАЧАТЬ",
                    difficulty: "Сложность",
                    stats: "Статистика",
                    endings: "Концовки",
                    sound: "Звук",
                    soundOn: "ВКЛ",
                    soundOff: "ВЫКЛ",
                    language: "Язык",
                    dailyRun: "Ежедневный запуск",
                    dailyAvailable: "Доступен ежедневный запуск"
                },
                difficulty: {
                    easy: "ЛЁГКО",
                    normal: "НОРМАЛЬНО",
                    hard: "ЖЁСТКО",
                    easyDesc: "Меньше давления.\nБольше пространства для ошибок.",
                    normalDesc: "Как задумано.\nОшибки имеют цену.",
                    hardDesc: "Быстро.\nБольно.\nБез права на ошибку."
                },
                stats: {
                    totalRuns: "Всего запусков:",
                    bestResult: "Лучший результат:",
                    commonFailure: "Частая причина провала:",
                    lastDifficulty: "Последняя сложность:",
                    insight: "ОСОЗНАНИЕ:",
                    unlockedEndings: "Разблокировано концовок:"
                },
                endings: {
                    title: "Концовки",
                    locked: "???",
                    unlocked: "Разблокировано"
                },
                game: {
                    decisions: "Решений:",
                    score: "Счет:",
                    collapse: "КОЛЛАПС",
                    restart: "В меню",
                    revive: "Восстановить (Реклама)",
                    percentile: "игроков",
                    survived: "Выжили дольше:"
                },
                stats: {
                    mind: "Разум",
                    heart: "Сердце",
                    time: "Время",
                    drive: "Движение"
                },
                endings: {
                    mind: {
                        title: "БЕЗУМИЕ",
                        description: "Ваш разум не выдержал давления. Логика и ясность покинули вас."
                    },
                    heart: {
                        title: "МОРАЛЬНЫЙ КОЛЛАПС",
                        description: "Эмпатия и мораль исчезли. Вы потеряли связь с человечностью."
                    },
                    time: {
                        title: "ИСТОЩЕНИЕ",
                        description: "Время и энергия закончились. Возможности упущены навсегда."
                    },
                    drive: {
                        title: "АПАТИЯ",
                        description: "Амбиции и желание успеха угасли. Движение вперед остановилось."
                    },
                    burnout: {
                        title: "ВЫГОРАНИЕ",
                        description: "Вы сгорели, пытаясь сохранить все одновременно."
                    },
                    obsession: {
                        title: "ОБСЕССИЯ",
                        description: "Вы стали одержимы одной целью, потеряв все остальное."
                    },
                    emptiness: {
                        title: "ПУСТОТА",
                        description: "Вы потеряли себя, пытаясь быть всем для всех."
                    },
                    sacrifice: {
                        title: "ЖЕРТВОПРИНОШЕНИЕ",
                        description: "Вы пожертвовали собой ради других, но потеряли себя."
                    }
                },
                insight: {
                    earned: "Получено ОСОЗНАНИЕ:",
                    total: "Всего ОСОЗНАНИЕ:"
                },
                modifier: {
                    active: "Активный модификатор:",
                    none: "Нет",
                    fast_mind: {
                        name: "Быстрый разум",
                        description: "Разум истощается быстрее"
                    },
                    fast_heart: {
                        name: "Холодное сердце",
                        description: "Сердце истощается быстрее"
                    },
                    fast_time: {
                        name: "Ускоренное время",
                        description: "Время истощается быстрее"
                    },
                    fast_drive: {
                        name: "Угасание амбиций",
                        description: "Движение истощается быстрее"
                    },
                    double_effect: {
                        name: "Двойной эффект",
                        description: "Каждое 5-е решение влияет на две статистики"
                    },
                    no_recovery: {
                        name: "Без восстановления",
                        description: "Одна статистика не может восстанавливаться"
                    },
                    harsh_end: {
                        name: "Жесткий финал",
                        description: "Последние 5 решений наносят больше урона"
                    }
                }
            },
            en: {
                // UI
                menu: {
                    title: "ONE CHOICE",
                    subtitle: "LIFE COLLAPSE",
                    tagline: "Every decision breaks something.",
                    start: "START",
                    difficulty: "Difficulty",
                    stats: "Statistics",
                    endings: "Endings",
                    sound: "Sound",
                    soundOn: "ON",
                    soundOff: "OFF",
                    language: "Language",
                    dailyRun: "Daily Run",
                    dailyAvailable: "Daily run available"
                },
                difficulty: {
                    easy: "EASY",
                    normal: "NORMAL",
                    hard: "HARD",
                    easyDesc: "Less pressure.\nMore room for mistakes.",
                    normalDesc: "As intended.\nMistakes have a price.",
                    hardDesc: "Fast.\nPainful.\nNo room for error."
                },
                stats: {
                    totalRuns: "Total runs:",
                    bestResult: "Best result:",
                    commonFailure: "Common failure:",
                    lastDifficulty: "Last difficulty:",
                    insight: "INSIGHT:",
                    unlockedEndings: "Unlocked endings:"
                },
                endings: {
                    title: "Endings",
                    locked: "???",
                    unlocked: "Unlocked"
                },
                game: {
                    decisions: "Decisions:",
                    score: "Score:",
                    collapse: "COLLAPSE",
                    restart: "To menu",
                    revive: "Revive (Ad)",
                    percentile: "players",
                    survived: "Survived longer than:"
                },
                stats: {
                    mind: "Mind",
                    heart: "Heart",
                    time: "Time",
                    drive: "Drive"
                },
                endings: {
                    mind: {
                        title: "MADNESS",
                        description: "Your mind could not withstand the pressure. Logic and clarity have left you."
                    },
                    heart: {
                        title: "MORAL COLLAPSE",
                        description: "Empathy and morality have disappeared. You have lost connection with humanity."
                    },
                    time: {
                        title: "EXHAUSTION",
                        description: "Time and energy have run out. Opportunities are lost forever."
                    },
                    drive: {
                        title: "APATHY",
                        description: "Ambitions and desire for success have faded. Forward movement has stopped."
                    },
                    burnout: {
                        title: "BURNOUT",
                        description: "You burned out trying to preserve everything at once."
                    },
                    obsession: {
                        title: "OBSESSION",
                        description: "You became obsessed with one goal, losing everything else."
                    },
                    emptiness: {
                        title: "EMPTINESS",
                        description: "You lost yourself trying to be everything to everyone."
                    },
                    sacrifice: {
                        title: "SACRIFICE",
                        description: "You sacrificed yourself for others, but lost yourself."
                    }
                },
                insight: {
                    earned: "Insight earned:",
                    total: "Total Insight:"
                },
                modifier: {
                    active: "Active modifier:",
                    none: "None",
                    fast_mind: {
                        name: "Fast Mind",
                        description: "Mind depletes faster"
                    },
                    fast_heart: {
                        name: "Cold Heart",
                        description: "Heart depletes faster"
                    },
                    fast_time: {
                        name: "Accelerated Time",
                        description: "Time depletes faster"
                    },
                    fast_drive: {
                        name: "Fading Ambition",
                        description: "Drive depletes faster"
                    },
                    double_effect: {
                        name: "Double Effect",
                        description: "Every 5th decision affects two stats"
                    },
                    no_recovery: {
                        name: "No Recovery",
                        description: "One stat cannot recover"
                    },
                    harsh_end: {
                        name: "Harsh End",
                        description: "Last 5 decisions deal more damage"
                    }
                }
            }
        };
    }

    /**
     * Получить текст
     * @param {string} path - Путь к тексту (например, 'menu.start')
     * @returns {string}
     */
    getText(path) {
        const parts = path.split('.');
        let value = this.texts[this.currentLanguage];
        
        for (const part of parts) {
            if (value && value[part]) {
                value = value[part];
            } else {
                // Fallback на русский
                value = this.texts.ru;
                for (const p of parts) {
                    value = value?.[p];
                }
                break;
            }
        }
        
        return typeof value === 'string' ? value : path;
    }

    /**
     * Установить язык
     * @param {string} language - Язык (ru, en)
     */
    setLanguage(language) {
        if (this.texts[language]) {
            this.currentLanguage = language;
            this.save();
        }
    }

    /**
     * Получить текущий язык
     * @returns {string}
     */
    getLanguage() {
        return this.currentLanguage;
    }

    /**
     * Сохранить язык
     */
    save() {
        try {
            localStorage.setItem('onechoice_language', this.currentLanguage);
        } catch (error) {
            console.warn('Не удалось сохранить язык:', error);
        }
    }

    /**
     * Загрузить язык
     */
    load() {
        try {
            const saved = localStorage.getItem('onechoice_language');
            if (saved && this.texts[saved]) {
                this.currentLanguage = saved;
            }
        } catch (error) {
            console.warn('Не удалось загрузить язык:', error);
        }
    }
}

