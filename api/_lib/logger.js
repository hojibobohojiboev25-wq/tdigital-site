/**
 * Centralized logger for serverless API.
 * Logs to stdout (Vercel captures these). No file I/O for serverless compatibility.
 */

const LOG_LEVEL = process.env.LOG_LEVEL || "info";
const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };

function levelAllowed(level) {
  return (LEVELS[level] || 1) >= (LEVELS[LOG_LEVEL] || 1);
}

function formatMessage(level, message, meta = {}) {
  const entry = {
    time: new Date().toISOString(),
    level,
    message
  };
  if (Object.keys(meta).length > 0) {
    entry.meta = meta;
  }
  return JSON.stringify(entry);
}

function log(level, message, meta) {
  if (!levelAllowed(level)) return;
  const out = formatMessage(level, message, meta);
  if (level === "error") {
    console.error(out);
  } else {
    console.log(out);
  }
}

module.exports = {
  debug(message, meta) {
    log("debug", message, meta);
  },
  info(message, meta) {
    log("info", message, meta);
  },
  warn(message, meta) {
    log("warn", message, meta);
  },
  error(message, meta) {
    log("error", message, meta);
  }
};
