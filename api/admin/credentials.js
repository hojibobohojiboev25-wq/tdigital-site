const bcrypt = require("bcryptjs");
const { Admin } = require("../_lib/models");
const { verifyAdminToken } = require("../_lib/auth");
const { sendJson, readJson } = require("../_lib/http");
const { validateCredentials } = require("../_lib/validate");
const logger = require("../_lib/logger");

module.exports = async function handler(req, res) {
  if (req.method !== "PUT") {
    return sendJson(res, 405, { error: "Method not allowed." });
  }

  const payload = verifyAdminToken(req);
  if (!payload) {
    return sendJson(res, 401, { error: "Unauthorized." });
  }

  let body = {};
  try {
    body = await readJson(req);
  } catch {
    return sendJson(res, 400, { error: "Invalid JSON payload." });
  }

  const validation = validateCredentials(body);
  if (!validation.valid) {
    return sendJson(res, 400, { error: "Validation failed.", details: validation.errors });
  }

  const { currentPassword, newUsername, newPassword } = validation.data;

  try {
    const admin = await Admin.findById(payload.sub);
    if (!admin) {
      return sendJson(res, 401, { error: "Unauthorized." });
    }

    const currentOk = await bcrypt.compare(currentPassword, admin.password_hash);
    if (!currentOk) {
      return sendJson(res, 400, { error: "Current password is incorrect." });
    }

    if (newUsername !== admin.username) {
      const exists = await Admin.findByUsername(newUsername);
      if (exists) {
        return sendJson(res, 400, { error: "Username is already in use." });
      }
    }

    const nextHash = await bcrypt.hash(newPassword, 12);
    const updated = await Admin.updateCredentials(admin.id, newUsername, nextHash);
    logger.info("Admin credentials updated", { adminId: admin.id });
    return sendJson(res, 200, {
      success: true,
      user: { id: updated.id, username: updated.username }
    });
  } catch (error) {
    logger.error("Credentials update failed", { message: error.message });
    return sendJson(res, 500, { error: "Failed to update credentials." });
  }
};
