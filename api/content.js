const { getContent } = require("./_lib/db");
const { sendJson } = require("./_lib/http");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return sendJson(res, 405, { error: "Method not allowed." });
  }

  try {
    const content = await getContent();
    return sendJson(res, 200, { content });
  } catch (error) {
    return sendJson(res, 500, { error: "Failed to load content.", details: error.message });
  }
};
