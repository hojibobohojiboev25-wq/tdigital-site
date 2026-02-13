const bcrypt = require("bcryptjs");
const { getAdminById, updateAdminCredentials, getAdminByUsername } = require("../_lib/db");
const { verifyAdminToken } = require("../_lib/auth");
const { sendJson, readJson } = require("../_lib/http");

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

  const currentPassword = String(body && body.currentPassword ? body.currentPassword : "");
  const newUsername = String(body && body.newUsername ? body.newUsername : "").trim();
  const newPassword = String(body && body.newPassword ? body.newPassword : "");

  if (!currentPassword || !newUsername || !newPassword) {
    return sendJson(res, 400, { error: "All fields are required." });
  }
  if (newPassword.length < 6) {
    return sendJson(res, 400, { error: "Password must contain at least 6 characters." });
  }

  try {
    const admin = await getAdminById(payload.sub);
    if (!admin) {
      return sendJson(res, 401, { error: "Unauthorized." });
    }

    const currentOk = await bcrypt.compare(currentPassword, admin.password_hash);
    if (!currentOk) {
      return sendJson(res, 400, { error: "Current password is incorrect." });
    }

    if (newUsername !== admin.username) {
      const exists = await getAdminByUsername(newUsername);
      if (exists) {
        return sendJson(res, 400, { error: "Username is already in use." });
      }
    }

    const nextHash = await bcrypt.hash(newPassword, 12);
    const updated = await updateAdminCredentials(admin.id, newUsername, nextHash);
    return sendJson(res, 200, {
      success: true,
      user: {
        id: updated.id,
        username: updated.username
      }
    });
  } catch (error) {
    return sendJson(res, 500, { error: "Failed to update credentials.", details: error.message });
  }
};
