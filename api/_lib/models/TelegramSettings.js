const { initDatabase, query } = require("../db");

async function get() {
  await initDatabase();
  const result = await query("SELECT chat_id, bot_token FROM telegram_settings WHERE id = 1");
  const row = result.rows[0];
  return row ? { chatId: row.chat_id || null, botToken: row.bot_token || null } : { chatId: null, botToken: null };
}

async function save(chatId, botToken) {
  await initDatabase();
  await query(
    "UPDATE telegram_settings SET chat_id = $1, bot_token = $2, updated_at = NOW() WHERE id = 1",
    [chatId || null, botToken || null]
  );
  return get();
}

module.exports = {
  get,
  save
};
