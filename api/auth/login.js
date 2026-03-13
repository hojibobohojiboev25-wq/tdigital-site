const bcrypt = require("bcryptjs");
const { getAdminByUsername } = require("../_lib/db");
const { createAdminToken } = require("../_lib/auth");
const { sendJson, readJson } = require("../_lib/http");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "Method not allowed." });
  }

  let body = {};
  try {
    body = await readJson(req);
  } catch {
    return sendJson(res, 400, { error: "Invalid JSON payload." });
  }

  const username = String(body && body.username ? body.username : "").trim();
  const password = String(body && body.password ? body.password : "");

  if (!username || !password) {
    return sendJson(res, 400, { error: "Username and password are required." });
  }

  try {
    const admin = await getAdminByUsername(username);
    if (!admin) {
      return sendJson(res, 401, { error: "Invalid credentials." });
    }

    const valid = await bcrypt.compare(password, admin.password_hash);
    if (!valid) {
      return sendJson(res, 401, { error: "Invalid credentials." });
    }

    const token = createAdminToken(admin);
    return sendJson(res, 200, {
      token,
      user: {
        id: admin.id,
        username: admin.username
      }
    });
  } catch (error) {
    return sendJson(res, 500, { error: "Login failed." });
  }
};
