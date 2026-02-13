const { getAdminById } = require("../_lib/db");
const { verifyAdminToken } = require("../_lib/auth");
const { sendJson } = require("../_lib/http");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return sendJson(res, 405, { error: "Method not allowed." });
  }

  const payload = verifyAdminToken(req);
  if (!payload) {
    return sendJson(res, 401, { error: "Unauthorized." });
  }

  try {
    const admin = await getAdminById(payload.sub);
    if (!admin) {
      return sendJson(res, 401, { error: "Unauthorized." });
    }
    return sendJson(res, 200, {
      user: {
        id: admin.id,
        username: admin.username
      }
    });
  } catch (error) {
    return sendJson(res, 500, { error: "Auth check failed.", details: error.message });
  }
};
