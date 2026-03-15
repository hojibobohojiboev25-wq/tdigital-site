const { TelegramSettings, Admin } = require("../_lib/models");
const { verifyAdminToken } = require("../_lib/auth");
const { sendJson, readJson } = require("../_lib/http");
const { validateTelegram } = require("../_lib/validate");
const logger = require("../_lib/logger");

function maskToken(token) {
  if (!token || token.length < 8) return token ? "••••" : "";
  return token.slice(0, 4) + "••••" + token.slice(-4);
}

module.exports = async function handler(req, res) {
  const payload = verifyAdminToken(req);
  if (!payload) {
    return sendJson(res, 401, { error: "Unauthorized." });
  }

  const admin = await Admin.findById(payload.sub);
  if (!admin) {
    return sendJson(res, 401, { error: "Unauthorized." });
  }

  if (req.method === "GET") {
    try {
      const { chatId, botToken } = await TelegramSettings.get();
      const configured = !!(process.env.TELEGRAM_CHAT_ID || chatId) && !!(process.env.TELEGRAM_BOT_TOKEN || botToken);
      return sendJson(res, 200, {
        configured,
        chatId: process.env.TELEGRAM_CHAT_ID || chatId || "",
        chatIdFromEnv: !!process.env.TELEGRAM_CHAT_ID,
        botTokenMasked: maskToken(process.env.TELEGRAM_BOT_TOKEN || botToken),
        botTokenFromEnv: !!process.env.TELEGRAM_BOT_TOKEN
      });
    } catch (error) {
      logger.error("Telegram settings fetch failed", { message: error.message });
      return sendJson(res, 500, { error: "Failed to load Telegram settings." });
    }
  }

  if (req.method === "PUT") {
    if (process.env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_CHAT_ID) {
      return sendJson(res, 400, {
        error: "Telegram is configured via environment variables. Remove TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID to use admin settings."
      });
    }
    let body = {};
    try {
      body = await readJson(req);
    } catch {
      return sendJson(res, 400, { error: "Invalid JSON payload." });
    }

    const validation = validateTelegram(body);
    if (!validation.valid) {
      return sendJson(res, 400, { error: "Validation failed.", details: validation.errors });
    }

    let { chatId, botToken } = validation.data;
    if (!botToken) {
      const current = await TelegramSettings.get();
      botToken = current.botToken;
    }

    try {
      await TelegramSettings.save(chatId, botToken);
      const settings = await TelegramSettings.get();
      logger.info("Telegram settings updated", { adminId: admin.id });
      return sendJson(res, 200, {
        configured: !!(settings.chatId && settings.botToken),
        chatId: settings.chatId || "",
        botTokenMasked: maskToken(settings.botToken)
      });
    } catch (error) {
      logger.error("Telegram save failed", { message: error.message });
      return sendJson(res, 500, { error: "Failed to save Telegram settings." });
    }
  }

  return sendJson(res, 405, { error: "Method not allowed." });
};
