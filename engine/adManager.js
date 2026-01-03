/**
 * Менеджер рекламы для Yandex Games
 */
class AdManager {
  constructor(environmentDetector = null) {
    this.yaGames = null;
    this.initialized = false;
    this.adCooldown = false;
    this.environmentDetector = environmentDetector;
    this.isStandalone = environmentDetector ? environmentDetector.isStandaloneMode() : true;
  }

  /**
   * Инициализация Yandex Games SDK
   */
  async initialize() {
    // В standalone режиме не инициализируем SDK
    if (this.isStandalone) {
      this.initialized = false;
      return;
    }

    try {
      // Проверяем наличие SDK и валидного окружения
      if (typeof YaGames !== "undefined" && this.environmentDetector && this.environmentDetector.isYandexGamesMode()) {
        try {
          this.yaGames = await YaGames.init();
          this.initialized = true;
          // Логируем только в dev режиме
          if (this.isDevMode()) {
            console.log("Yandex Games SDK инициализирован");
          }
        } catch (initError) {
          // Молча игнорируем ошибки инициализации
          this.initialized = false;
        }
      } else {
        this.initialized = false;
      }
    } catch (error) {
      // Молча игнорируем все ошибки
      this.initialized = false;
    }
  }

  /**
   * Проверить, dev ли режим
   * @returns {boolean}
   */
  isDevMode() {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' ||
           window.location.hostname.includes('localhost');
  }

  /**
   * Показать рекламу с наградой
   * @param {string} type - Тип рекламы: 'revive', 'undo', 'continue'
   * @returns {Promise<boolean>} - Успешно ли показана реклама
   */
  async showRewardedAd(type) {
    // В standalone режиме всегда возвращаем успех без показа рекламы
    if (this.isStandalone || !this.initialized || !this.yaGames) {
      return new Promise((resolve) => {
        setTimeout(() => resolve(true), 100);
      });
    }

    if (this.adCooldown) {
      console.warn("Реклама в кулдауне");
      return false;
    }

    try {
      this.adCooldown = true;
      const result = await this.yaGames.adv.showRewardedVideo({
        callbacks: {
          onOpen: () => {
            console.log("Реклама открыта");
          },
          onRewarded: () => {
            console.log("Награда получена");
          },
          onClose: () => {
            console.log("Реклама закрыта");
            setTimeout(() => {
              this.adCooldown = false;
            }, 1000);
          },
          onError: (error) => {
            console.error("Ошибка рекламы:", error);
            this.adCooldown = false;
          },
        },
      });

      return result;
    } catch (error) {
      console.error("Ошибка показа рекламы:", error);
      this.adCooldown = false;
      return false;
    }
  }

  /**
   * Показать межстраничную рекламу
   * @returns {Promise<boolean>}
   */
  async showInterstitialAd() {
    // В standalone режиме просто возвращаем успех
    if (this.isStandalone || !this.initialized || !this.yaGames) {
      return true;
    }

    try {
      await this.yaGames.adv.showFullscreenAdv({
        callbacks: {
          onOpen: () => {
            console.log("Межстраничная реклама открыта");
          },
          onClose: (wasShown) => {
            console.log("Межстраничная реклама закрыта", wasShown);
          },
          onError: (error) => {
            console.error("Ошибка межстраничной рекламы:", error);
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Ошибка показа межстраничной рекламы:", error);
      return false;
    }
  }

  /**
   * Проверить, инициализирован ли SDK
   * @returns {boolean}
   */
  isInitialized() {
    return this.initialized;
  }
}
