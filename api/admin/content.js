const { SiteContent, Admin } = require("../_lib/models");
const { verifyAdminToken } = require("../_lib/auth");
const { sendJson, readJson } = require("../_lib/http");
const { validateContent } = require("../_lib/validate");
const logger = require("../_lib/logger");

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
      const content = await SiteContent.get();
      return sendJson(res, 200, { content });
    } catch (error) {
      logger.error("Admin content fetch failed", { message: error.message });
      return sendJson(res, 500, { error: "Failed to load content." });
    }
  }

  if (req.method === "PUT") {
    let body = {};
    try {
      body = await readJson(req);
    } catch {
      return sendJson(res, 400, { error: "Invalid JSON payload." });
    }

    const validation = validateContent(body);
    if (!validation.valid) {
      return sendJson(res, 400, { error: "Validation failed.", details: validation.errors });
    }

    try {
      const saved = await SiteContent.save(validation.data);
      logger.info("Content updated", { adminId: admin.id });
      return sendJson(res, 200, { content: saved.data, updatedAt: saved.updated_at });
    } catch (error) {
      logger.error("Content save failed", { message: error.message });
      return sendJson(res, 500, { error: "Failed to save content." });
    }
  }

  return sendJson(res, 405, { error: "Method not allowed." });
};
