const pool = require('./pool');

// Joins to users so we always have author name/email available; the view
// layer decides whether to actually reveal it based on the viewer's role.
async function getAllMessages() {
  const { rows } = await pool.query(
    `SELECT
       messages.id,
       messages.title,
       messages.text,
       messages.timestamp,
       users.id AS author_id,
       users.first_name AS author_first_name,
       users.last_name AS author_last_name
     FROM messages
     JOIN users ON messages.user_id = users.id
     ORDER BY messages.timestamp DESC`
  );
  return rows;
}

async function createMessage({ title, text, userId }) {
  const { rows } = await pool.query(
    `INSERT INTO messages (title, text, user_id)
     VALUES ($1, $2, $3)
     RETURNING id, title, text, timestamp, user_id`,
    [title, text, userId]
  );
  return rows[0];
}

async function deleteMessage(messageId) {
  await pool.query('DELETE FROM messages WHERE id = $1', [messageId]);
}

async function findMessageById(messageId) {
  const { rows } = await pool.query('SELECT * FROM messages WHERE id = $1', [messageId]);
  return rows[0];
}

module.exports = {
  getAllMessages,
  createMessage,
  deleteMessage,
  findMessageById,
};
