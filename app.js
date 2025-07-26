const express = require('express');
const cors = require('cors');

const app = express();

const customerRoutes = require('./routes/customerRoutes');
const loanRoutes = require('./routes/loanRoutes');

app.use(cors());
app.use(express.json());

app.use('/customers', customerRoutes);
app.use('/loans', loanRoutes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Central error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;