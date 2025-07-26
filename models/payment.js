const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Loan = require('./loan');

const Payment = sequelize.define('Payment', {
  payment_id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  loan_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  amount: DataTypes.DECIMAL,
  payment_type: DataTypes.STRING,
  payment_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'Payments',
  timestamps: false
});

Payment.belongsTo(Loan, { foreignKey: 'loan_id' });
Loan.hasMany(Payment, { foreignKey: 'loan_id' }); 

module.exports = Payment;