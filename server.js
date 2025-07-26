const app = require('./app');
const sequelize = require('./config/database');

// Models
require('./models/customer');
require('./models/loan');
require('./models/payment');

const PORT = process.env.PORT || 3000;

sequelize.sync().then(() => {
  console.log('Database synced');
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Unable to sync DB:', err);
});