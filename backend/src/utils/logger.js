import fs from 'fs';
import path from 'path';

const LOG_DIR = path.join(process.cwd(), 'logs');

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const sanitizeLogData = (data) => {
  if (!data) return '';
  if (typeof data !== 'object') return data;
  
  // Clone object to avoid side effects
  const cloned = { ...data };
  const sensitiveKeys = ['password', 'token', 'jwt', 'confirmPassword', 'otp', 'creditCard'];
  
  for (const key of sensitiveKeys) {
    if (key in cloned) {
      cloned[key] = '[REDACTED]';
    }
  }
  return JSON.stringify(cloned);
};

const formatMessage = (level, message, meta) => {
  const timestamp = new Date().toISOString();
  const metaString = meta ? ` | Meta: ${sanitizeLogData(meta)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaString}\n`;
};

const writeLog = (level, message, meta) => {
  const logMessage = formatMessage(level, message, meta);
  
  // Print to console (always enable this in production for Heroku log streaming)
  console.log(logMessage.trim());

  // Write to log file
  const fileName = level === 'error' ? 'error.log' : 'combined.log';
  const filePath = path.join(LOG_DIR, fileName);
  fs.appendFile(filePath, logMessage, (err) => {
    if (err) console.error('Failed to write to log file:', err);
  });
};

const logger = {
  info: (message, meta) => writeLog('info', message, meta),
  warn: (message, meta) => writeLog('warn', message, meta),
  error: (message, meta) => writeLog('error', message, meta),
};

export default logger;
