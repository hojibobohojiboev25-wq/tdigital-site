const bcrypt = require("bcryptjs");
const { Admin } = require("../_lib/models");
const { sendJson, readJson, getClientIp } = require("../_lib/http");
const { validateBootstrap } = require("../_lib/validate");
const logger = require("../_lib/logger");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "Method not allowed." });
  }

  const bootstrapSecret = process.env.ADMIN_BOOTSTRAP_SECRET || "";
  if (!bootstrapSecret) {
    return sendJson(res, 403, { error: "Bootstrap is disabled." });
  }

  let body = {};
  try {
    body = await readJson(req);
  } catch {
    return sendJson(res, 400, { error: "Invalid JSON payload." });
  }

  const validation = validateBootstrap(body);
  if (!validation.valid) {
    return sendJson(res, 400, { error: "Validation failed.", details: validation.errors });
  }

  const { secret, username, password } = validation.data;

  if (secret !== bootstrapSecret) {
    logger.warn("Bootstrap invalid secret", { ip: getClientIp(req) });
    return sendJson(res, 401, { error: "Invalid secret." });
  }

  try {
    const admin = await Admin.getPrimary();
    if (!admin) {
      return sendJson(res, 500, { error: "Admin record not found." });
    }

    const hash = await bcrypt.hash(password, 12);
    const updated = await Admin.updateCredentials(admin.id, username, hash);
    logger.info("Bootstrap: admin credentials reset", { adminId: admin.id, ip: getClientIp(req) });
    return sendJson(res, 200, { success: true, user: updated });
  } catch (error) {
    logger.error("Bootstrap failed", { message: error.message });
    return sendJson(res, 500, { error: "Bootstrap failed." });
  }
};
