const sql = require('mssql/msnodesqlv8');

const config = {
  server: process.env.DB_SERVER || '.\\SQLEXPRESS',
  database: process.env.DB_DATABASE || process.env.DB_NAME || 'courier_management',
  driver: 'ODBC Driver 17 for SQL Server',
  options: {
    trustedConnection: true,
    trustServerCertificate: true,
  },
  connectionTimeout: 10000,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

const pool = new sql.ConnectionPool(config);
const poolPromise = pool
  .connect()
  .then((p) => {
    console.log('Database connected successfully!');
    return p;
  })
  .catch((err) => {
    console.error('SQL Connection Error:', err.message);
    throw err;
  });

// controller গুলোর জন্য executeQuery ফাংশনটি যোগ করা হলো
const executeQuery = async (queryText) => {
  try {
    const connectedPool = await poolPromise;
    const result = await connectedPool.request().query(queryText);
    return result;
  } catch (err) {
    console.error('Query Execution Error:', err.message);
    throw err;
  }
};

module.exports = { sql, poolPromise, executeQuery };