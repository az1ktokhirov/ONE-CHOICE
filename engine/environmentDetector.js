/**
 * Детектор окружения платформы
 */
class EnvironmentDetector {
    constructor() {
        this.environment = this.detectEnvironment();
        this.isStandalone = this.environment === 'standalone';
        this.isYandexGames = this.environment === 'yandex';
    }

    /**
     * Определить окружение
     * @returns {string} 'standalone' | 'yandex' | 'unknown'
     */
    detectEnvironment() {
        // Проверяем наличие Yandex Games SDK
        if (typeof YaGames !== 'undefined') {
            // Проверяем, что мы в iframe и есть parent
            if (this.isInIframe() && this.hasValidParent()) {
                try {
                    // Проверяем наличие appId или других признаков Yandex Games
                    if (window.location.search.includes('appId') || 
                        window.parent !== window) {
                        return 'yandex';
                    }
                } catch (e) {
                    // Если нет доступа к parent, значит standalone
                    return 'standalone';
                }
            }
        }
        
        // По умолчанию standalone
        return 'standalone';
    }

    /**
     * Проверить, находимся ли мы в iframe
     * @returns {boolean}
     */
    isInIframe() {
        try {
            return window.self !== window.top;
        } catch (e) {
            // Если нет доступа, значит не в iframe
            return false;
        }
    }

    /**
     * Проверить, есть ли валидный parent window
     * @returns {boolean}
     */
    hasValidParent() {
        try {
            return window.parent && window.parent !== window;
        } catch (e) {
            return false;
        }
    }

    /**
     * Безопасная отправка сообщения в parent
     * @param {string} type - Тип сообщения
     * @param {*} data - Данные
     * @returns {boolean} - Успешно ли отправлено
     */
    safePostMessage(type, data) {
        if (!this.isYandexGames || !this.hasValidParent()) {
            return false;
        }

        try {
            window.parent.postMessage({
                type: type,
                data: data
            }, '*');
            return true;
        } catch (e) {
            // Молча игнорируем ошибки
            return false;
        }
    }

    /**
     * Получить текущее окружение
     * @returns {string}
     */
    getEnvironment() {
        return this.environment;
    }

    /**
     * Проверить, standalone ли режим
     * @returns {boolean}
     */
    isStandaloneMode() {
        return this.isStandalone;
    }

    /**
     * Проверить, Yandex Games ли режим
     * @returns {boolean}
     */
    isYandexGamesMode() {
        return this.isYandexGames;
    }
}

