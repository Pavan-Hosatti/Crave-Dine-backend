const app = require('./app');
const dbConnection = require('./database/dbConnection');

dbConnection();

const PORT = process.env.PORT || 9000;

const server = app.listen(PORT, () => {
  // Console log removed for clean production output
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    // Specific error message for port in use removed for clean production output
  }
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  // Console error removed for clean production output
  process.exit(1);
});

process.on('uncaughtException', (err, origin) => {
  // Console error removed for clean production output
  process.exit(1);
});
