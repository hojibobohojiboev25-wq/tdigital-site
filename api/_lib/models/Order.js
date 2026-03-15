const { initDatabase, query } = require("../db");

async function create(fields) {
  await initDatabase();
  const result = await query(
    `INSERT INTO orders (name, email, phone, service, message)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email, phone, service, message, created_at`,
    [
      fields.name ?? null,
      fields.email ?? null,
      fields.phone ?? null,
      fields.service ?? null,
      fields.message ?? ""
    ]
  );
  return result.rows[0];
}

async function findAll() {
  await initDatabase();
  const result = await query(
    "SELECT id, name, email, phone, service, message, created_at FROM orders ORDER BY created_at DESC"
  );
  return result.rows;
}

module.exports = {
  create,
  findAll
};
