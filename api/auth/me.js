const { Admin } = require("../_lib/models");
const { verifyAdminToken } = require("../_lib/auth");
const { sendJson } = require("../_lib/http");
const logger = require("../_lib/logger");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return sendJson(res, 405, { error: "Method not allowed." });
  }

  const payload = verifyAdminToken(req);
  if (!payload) {
    return sendJson(res, 401, { error: "Unauthorized." });
  }

  try {
    const admin = await Admin.findById(payload.sub);
    if (!admin) {
      return sendJson(res, 401, { error: "Unauthorized." });
    }
    return sendJson(res, 200, {
      user: { id: admin.id, username: admin.username }
    });
  } catch (error) {
    logger.error("Auth me failed", { message: error.message });
    return sendJson(res, 500, { error: "Auth check failed." });
  }
};
