const app = require('./app');
const dbConnection = require('./database/dbConnection');

dbConnection();

const PORT = process.env.PORT || 9000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use.`);
  }
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (err, origin) => {
  console.error('Uncaught Exception at:', origin, 'error:', err);
  process.exit(1);
});
