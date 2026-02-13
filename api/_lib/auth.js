const jwt = require("jsonwebtoken");

const JWT_EXPIRES_IN = "12h";

function getJwtSecret() {
  return process.env.JWT_SECRET || "change-this-jwt-secret-in-production";
}

function createAdminToken(admin) {
  return jwt.sign(
    {
      sub: admin.id,
      username: admin.username
    },
    getJwtSecret(),
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function readBearerToken(req) {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) return "";
  return authHeader.slice(7);
}

function verifyAdminToken(req) {
  const token = readBearerToken(req);
  if (!token) return null;
  try {
    return jwt.verify(token, getJwtSecret());
  } catch {
    return null;
  }
}

module.exports = {
  createAdminToken,
  verifyAdminToken
};
