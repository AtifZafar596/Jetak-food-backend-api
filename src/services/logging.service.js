class LoggingService {
  static info(message, data = {}) {
    console.log(`ℹ️ INFO: ${message}`, data);
  }

  static error(message, error = null, data = {}) {
    console.error(`❌ ERROR: ${message}`, error || '', data);
  }

  static warn(message, data = {}) {
    console.warn(`⚠️ WARNING: ${message}`, data);
  }

  static debug(message, data = {}) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`🔍 DEBUG: ${message}`, data);
    }
  }
}

module.exports = LoggingService; 