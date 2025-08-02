// server.js (Your main application entry file)

const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// --- Load environment variables from config/config.env ---
// This MUST be the first executable block to ensure variables are available globally.
const configPath = path.join(__dirname, 'config', 'config.env');
if (fs.existsSync(configPath)) {
  dotenv.config({ path: configPath });
 
} else {
  console.error(`❌ Error: config.env not found at: ${configPath}. Please ensure it exists.`);
  process.exit(1);
}




const app = require('./app');
const dbConnection = require('./database/dbConnection');

// --- Database Connection ---
dbConnection();

// --- Server Configuration ---
const PORT = process.env.PORT || 9000;

// --- Start Server ---
const server = app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

// --- Server Error Handling ---
server.on('error', (err) => {
  console.error(`❌ Unhandled server error on port ${PORT}:`, err);
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please kill the process or choose a different port.`);
  }
  process.exit(1);
});

// --- Global Error Handling ---
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (err, origin) => {
  console.error('❌ Uncaught Exception at:', origin, 'error:', err);
  process.exit(1);
});
