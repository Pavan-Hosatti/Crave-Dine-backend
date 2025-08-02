// server.js (Your main application entry file with conditional environment loading)

const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// --- Conditional Load environment variables from config/config.env ---
// This block will only execute if NODE_ENV is 'development' and config.env exists.
// In production (e.g., on Render), NODE_ENV will likely be 'production' or undefined,
// and environment variables are injected directly by the hosting platform.
if (process.env.NODE_ENV !== 'production') {
    const configPath = path.join(__dirname, 'config', 'config.env');
    if (fs.existsSync(configPath)) {
        dotenv.config({ path: configPath });
   
    } else {

        // Do NOT exit here, as it might be a production environment where it's not needed.
    }
} else {
    console.log('🚀 Running in production mode. Environment variables expected from hosting platform.');
}


const app = require('./app');
const dbConnection = require('./database/dbConnection');

// --- Database Connection ---
dbConnection();

// --- Server Configuration ---
// PORT will be provided by environment variables (either from config.env locally or Render)
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
   
    process.exit(1);
});

process.on('uncaughtException', (err, origin) => {
    
    process.exit(1);
});
