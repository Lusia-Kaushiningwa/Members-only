const { Pool } = require('pg');

// Prefer a single DATABASE_URL (what most PaaS providers give you), but fall
// back to discrete PG* env vars for local development.
const connectionConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      host: process.env.PGHOST,
      port: process.env.PGPORT,
      database: process.env.PGDATABASE,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
    };

if (process.env.PG_SSL === 'true') {
  connectionConfig.ssl = { rejectUnauthorized: false };
}

const pool = new Pool(connectionConfig);

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
});

module.exports = pool;
