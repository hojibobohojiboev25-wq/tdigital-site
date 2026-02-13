const { getContent, saveContent, getAdminById } = require("../_lib/db");
const { verifyAdminToken } = require("../_lib/auth");
const { sendJson, readJson } = require("../_lib/http");

module.exports = async function handler(req, res) {
  const payload = verifyAdminToken(req);
  if (!payload) {
    return sendJson(res, 401, { error: "Unauthorized." });
  }

  const admin = await getAdminById(payload.sub);
  if (!admin) {
    return sendJson(res, 401, { error: "Unauthorized." });
  }

  if (req.method === "GET") {
    try {
      const content = await getContent();
      return sendJson(res, 200, { content });
    } catch (error) {
      return sendJson(res, 500, { error: "Failed to load content.", details: error.message });
    }
  }

  if (req.method === "PUT") {
    let body = {};
    try {
      body = await readJson(req);
    } catch {
      return sendJson(res, 400, { error: "Invalid JSON payload." });
    }

    const content = body && body.content ? body.content : null;
    if (!content || typeof content !== "object") {
      return sendJson(res, 400, { error: "Invalid content payload." });
    }

    try {
      const saved = await saveContent(content);
      return sendJson(res, 200, { content: saved.data, updatedAt: saved.updated_at });
    } catch (error) {
      return sendJson(res, 500, { error: "Failed to save content.", details: error.message });
    }
  }

  return sendJson(res, 405, { error: "Method not allowed." });
};
