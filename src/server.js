require('dotenv').config();

const app = require('./app');
const pool = require('./config/database');

const PORT = Number(process.env.PORT) || 5000;

// Check the database before accepting API requests.
async function startServer() {
  try {
    const connection = await pool.getConnection();
    console.log('MySQL database connected successfully.');
    connection.release();

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Could not connect to MySQL:', error.message);
    process.exit(1);
  }
}

startServer();
