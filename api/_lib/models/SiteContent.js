const { initDatabase, query } = require("../db");
const { defaultContent } = require("../defaultContent");

async function get() {
  await initDatabase();
  const result = await query("SELECT data FROM site_content WHERE id = 1");
  return result.rows[0] ? result.rows[0].data : defaultContent;
}

async function save(data) {
  await initDatabase();
  const result = await query(
    "UPDATE site_content SET data = $1::jsonb, updated_at = NOW() WHERE id = 1 RETURNING data, updated_at",
    [JSON.stringify(data)]
  );
  return result.rows[0];
}

module.exports = {
  get,
  save
};
