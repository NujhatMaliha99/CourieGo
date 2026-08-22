const sql = require('mssql/msnodesqlv8');

const config = {
  server: process.env.DB_SERVER || 'DESKTOP-N4MRI66\\SQLEXPRESS',
  database: process.env.DB_NAME || 'courier_management',
  driver: 'msnodesqlv8',
  options: {
    trustedConnection: true,
    trustServerCertificate: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

const pool = new sql.ConnectionPool(config);
const poolPromise = pool.connect();

module.exports = { sql, poolPromise };
