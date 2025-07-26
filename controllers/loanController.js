const { v4: uuidv4 } = require('uuid');
const Loan = require('../models/loan');
const Payment = require('../models/payment');
const Customer = require('../models/customer');
const { Op } = require('sequelize');

// Create Loan
exports.createLoan = async (req, res) => {
  try {
    const { customer_id, loan_amount, loan_period_years, interest_rate_yearly } = req.body;

    const customer = await Customer.findByPk(customer_id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    const P = parseFloat(loan_amount);
    const N = parseFloat(loan_period_years);
    const R = parseFloat(interest_rate_yearly);

    const I = P * N * (R / 100);
    const A = P + I;
    const emi = parseFloat((A / (N * 12)).toFixed(2));

    const loan = await Loan.create({
      loan_id: uuidv4(),
      customer_id,
      principal_amount: P,
      total_amount: A,
      interest_rate: R,
      loan_period_years: N,
      monthly_emi: emi
    });

    res.status(201).json({
      loan_id: loan.loan_id,
      customer_id,
      total_amount_payable: A,
      monthly_emi: emi
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Record Payment
exports.recordPayment = async (req, res) => {
  try {
    const { loan_id } = req.params;
    const { amount, payment_type } = req.body;

    const loan = await Loan.findByPk(loan_id);
    if (!loan) return res.status(404).json({ error: 'Loan not found' });

    const payment = await Payment.create({
      payment_id: uuidv4(),
      loan_id,
      amount,
      payment_type
    });

    // Calculate total paid
    const payments = await Payment.findAll({ where: { loan_id } });
    const amount_paid = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const balance = parseFloat(loan.total_amount) - amount_paid;
    const emis_left = Math.ceil(balance / parseFloat(loan.monthly_emi));

    res.status(200).json({
      payment_id: payment.payment_id,
      loan_id,
      message: 'Payment recorded successfully.',
      remaining_balance: parseFloat(balance.toFixed(2)),
      emis_left
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// View Ledger
exports.viewLedger = async (req, res) => {
  try {
    const { loan_id } = req.params;
    const loan = await Loan.findByPk(loan_id);
    if (!loan) return res.status(404).json({ error: 'Loan not found' });

    const customer = await Customer.findByPk(loan.customer_id);
    const payments = await Payment.findAll({ where: { loan_id } });

    const amount_paid = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const balance_amount = parseFloat(loan.total_amount) - amount_paid;
    const emis_left = Math.ceil(balance_amount / parseFloat(loan.monthly_emi));

    res.status(200).json({
      loan_id,
      customer_id: loan.customer_id,
      principal: parseFloat(loan.principal_amount),
      total_amount: parseFloat(loan.total_amount),
      monthly_emi: parseFloat(loan.monthly_emi),
      amount_paid: parseFloat(amount_paid.toFixed(2)),
      balance_amount: parseFloat(balance_amount.toFixed(2)),
      emis_left,
      transactions: payments.map(p => ({
        transaction_id: p.payment_id,
        date: p.payment_date,
        amount: parseFloat(p.amount),
        type: p.payment_type
      }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};