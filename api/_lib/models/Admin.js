const { initDatabase, query } = require("../db");

async function findByUsername(username) {
  await initDatabase();
  const result = await query("SELECT * FROM admins WHERE username = $1 LIMIT 1", [username]);
  return result.rows[0] || null;
}

async function findById(adminId) {
  await initDatabase();
  const result = await query("SELECT * FROM admins WHERE id = $1 LIMIT 1", [adminId]);
  return result.rows[0] || null;
}

async function getPrimary() {
  await initDatabase();
  const result = await query("SELECT * FROM admins ORDER BY id ASC LIMIT 1");
  return result.rows[0] || null;
}

async function updateCredentials(adminId, nextUsername, nextPasswordHash) {
  await initDatabase();
  const result = await query(
    "UPDATE admins SET username = $2, password_hash = $3, updated_at = NOW() WHERE id = $1 RETURNING id, username",
    [adminId, nextUsername, nextPasswordHash]
  );
  return result.rows[0] || null;
}

module.exports = {
  findByUsername,
  findById,
  getPrimary,
  updateCredentials
};
