// Runs schema.sql against the configured database.
// Usage: npm run db:init
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('./pool');

async function main() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  try {
    await pool.query(schema);
    console.log('✅ Database schema created/verified successfully.');
  } catch (err) {
    console.error('❌ Failed to initialize database:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
