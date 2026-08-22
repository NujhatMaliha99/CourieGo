require('dotenv').config();

const app = require('./app');
const { poolPromise } = require('./config/database');

const PORT = Number(process.env.PORT) || 5000;

// Check the database before accepting API requests.
async function startServer() {
  try {
    await poolPromise;
    console.log('Microsoft SQL Server connected successfully.');

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Could not connect to Microsoft SQL Server:', error.message);
    process.exit(1);
  }
}

startServer();
