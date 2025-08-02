
const app = require('./app');
const dbConnection = require('./database/dbConnection');

dbConnection();

const PORT = process.env.PORT || 9000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
