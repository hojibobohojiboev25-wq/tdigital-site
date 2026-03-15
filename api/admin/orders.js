const { Order, Admin } = require("../_lib/models");
const { verifyAdminToken } = require("../_lib/auth");
const { sendJson } = require("../_lib/http");
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

  if (req.method !== "GET") {
    return sendJson(res, 405, { error: "Method not allowed." });
  }

  try {
    const orders = await Order.findAll();
    return sendJson(res, 200, { orders });
  } catch (error) {
    logger.error("Orders fetch failed", { message: error.message });
    return sendJson(res, 500, { error: "Failed to load orders." });
  }
};
