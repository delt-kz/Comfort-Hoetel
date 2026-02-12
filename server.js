require('dotenv').config();
const app = require('./src/app');
const { bootstrapUsers } = require('./src/config/bootstrap');

const PORT = process.env.PORT || 3000;

async function start() {
  await bootstrapUsers();
  app.listen(PORT, () => {
    console.log(`Comfort Hoetel server started on http://localhost:${PORT}`);
  });
}

start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
