/**
 * Logger Configuration
 * Centralized logging untuk seluruh aplikasi
 */

const fs = require('fs');
const path = require('path');

// Create logs directory jika belum ada
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

const logger = {
  // Log info messages
  info: (message, data = null) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] INFO: ${message}`;
    console.log(logMessage, data || '');
    
    const logFile = path.join(logsDir, 'app.log');
    fs.appendFileSync(logFile, logMessage + '\n');
  },

  // Log error messages
  error: (message, error = null) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ERROR: ${message}`;
    console.error(logMessage, error || '');
    
    const logFile = path.join(logsDir, 'error.log');
    fs.appendFileSync(logFile, logMessage + (error ? '\n' + error.stack : '') + '\n');
  },

  // Log warning messages
  warn: (message, data = null) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] WARN: ${message}`;
    console.warn(logMessage, data || '');
    
    const logFile = path.join(logsDir, 'app.log');
    fs.appendFileSync(logFile, logMessage + '\n');
  },

  // Log debug messages (development only)
  debug: (message, data = null) => {
    if (process.env.NODE_ENV !== 'production') {
      const timestamp = new Date().toISOString();
      const logMessage = `[${timestamp}] DEBUG: ${message}`;
      console.debug(logMessage, data || '');
    }
  }
};

module.exports = logger;
