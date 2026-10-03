const pool = require('./pool');

async function createUser({ firstName, lastName, email, hashedPassword, isAdmin = false }) {
  const { rows } = await pool.query(
    `INSERT INTO users (first_name, last_name, email, password, is_admin)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, first_name, last_name, email, membership_status, is_admin, created_at`,
    [firstName, lastName, email, hashedPassword, isAdmin]
  );
  return rows[0];
}

async function findUserByEmail(email) {
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0];
}

async function findUserById(id) {
  const { rows } = await pool.query(
    `SELECT id, first_name, last_name, email, membership_status, is_admin, created_at
     FROM users WHERE id = $1`,
    [id]
  );
  return rows[0];
}

async function setMembershipStatus(userId, status) {
  await pool.query('UPDATE users SET membership_status = $1 WHERE id = $2', [status, userId]);
}

async function setAdminStatus(userId, status) {
  await pool.query('UPDATE users SET is_admin = $1 WHERE id = $2', [status, userId]);
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  setMembershipStatus,
  setAdminStatus,
};
