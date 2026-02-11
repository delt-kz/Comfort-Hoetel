require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Comfort Hoetel server started on http://localhost:${PORT}`);
});
