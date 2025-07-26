const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Customer = require('./customer');

const Loan = sequelize.define('Loan', {
  loan_id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  customer_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  principal_amount: DataTypes.DECIMAL,
  total_amount: DataTypes.DECIMAL,
  interest_rate: DataTypes.DECIMAL,
  loan_period_years: DataTypes.INTEGER,
  monthly_emi: DataTypes.DECIMAL,
  status: {
    type: DataTypes.STRING,
    defaultValue: 'ACTIVE'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'Loans',
  timestamps: false
});

Loan.belongsTo(Customer, { foreignKey: 'customer_id' });
Customer.hasMany(Loan, { foreignKey: 'customer_id' });

module.exports = Loan;