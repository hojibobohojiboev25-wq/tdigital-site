const bcrypt = require("bcryptjs");
const { Admin } = require("../_lib/models");
const { createAdminToken } = require("../_lib/auth");
const { sendJson, readJson, getClientIp } = require("../_lib/http");
const { validateLogin } = require("../_lib/validate");
const rateLimit = require("../_lib/rateLimit");
const logger = require("../_lib/logger");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "Method not allowed." });
  }

  if (await rateLimit.check(req, res, "login")) return;

  let body = {};
  try {
    body = await readJson(req);
  } catch {
    logger.warn("Login invalid JSON", { ip: getClientIp(req) });
    return sendJson(res, 400, { error: "Invalid JSON payload." });
  }

  const validation = validateLogin(body);
  if (!validation.valid) {
    return sendJson(res, 400, { error: "Validation failed.", details: validation.errors });
  }

  const { username, password } = validation.data;

  try {
    const admin = await Admin.findByUsername(username);
    if (!admin) {
      logger.warn("Login failed: unknown user", { username, ip: getClientIp(req) });
      return sendJson(res, 401, { error: "Invalid credentials." });
    }

    const valid = await bcrypt.compare(password, admin.password_hash);
    if (!valid) {
      logger.warn("Login failed: bad password", { username, ip: getClientIp(req) });
      return sendJson(res, 401, { error: "Invalid credentials." });
    }

    const token = createAdminToken(admin);
    logger.info("Admin logged in", { adminId: admin.id, username: admin.username, ip: getClientIp(req) });
    return sendJson(res, 200, {
      token,
      user: { id: admin.id, username: admin.username }
    });
  } catch (error) {
    logger.error("Login error", { message: error.message, stack: error.stack });
    return sendJson(res, 500, { error: "Login failed." });
  }
};
