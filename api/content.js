const { SiteContent } = require("./_lib/models");
const { sendJson } = require("./_lib/http");
const rateLimit = require("./_lib/rateLimit");
const logger = require("./_lib/logger");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return sendJson(res, 405, { error: "Method not allowed." });
  }

  if (await rateLimit.check(req, res, "content")) return;

  try {
    const content = await SiteContent.get();
    res.setHeader("Cache-Control", "public, max-age=60");
    return sendJson(res, 200, { content });
  } catch (error) {
    logger.error("Content fetch failed", { message: error.message });
    return sendJson(res, 500, { error: "Failed to load content." });
  }
};
