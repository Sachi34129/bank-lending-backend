const { v4: uuidv4 } = require('uuid');
const Customer = require('../models/customer');
const Loan = require('../models/loan');
const Payment = require('../models/payment');

exports.getAccountOverview = async (req, res) => {
  try {
    const { customer_id } = req.params;

    const customer = await Customer.findByPk(customer_id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    const loans = await customer.getLoans(); // <- use association

    const response = await Promise.all(loans.map(async loan => {
      const payments = await Payment.findAll({ where: { loan_id: loan.loan_id } });
      const amount_paid = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
      const total_interest = parseFloat(loan.total_amount) - parseFloat(loan.principal_amount);
      const emis_left = Math.ceil((loan.total_amount - amount_paid) / loan.monthly_emi);

      return {
        loan_id: loan.loan_id,
        principal: parseFloat(loan.principal_amount),
        total_amount: parseFloat(loan.total_amount),
        total_interest: parseFloat(total_interest.toFixed(2)),
        emi_amount: parseFloat(loan.monthly_emi),
        amount_paid: parseFloat(amount_paid.toFixed(2)),
        emis_left
      };
    }));

    res.status(200).json({
      customer_id,
      total_loans: response.length,
      loans: response
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a new customer
exports.createCustomer = async (req, res) => {
  try {
    const { customer_id, name } = req.body;

    if (!customer_id || !name) {
      return res.status(400).json({ error: 'customer_id and name are required' });
    }

    const existing = await Customer.findByPk(customer_id);
    if (existing) {
      return res.status(400).json({ error: 'Customer with this ID already exists' });
    }

    const customer = await Customer.create({
      customer_id,
      name
    });

    res.status(201).json({
      message: 'Customer created successfully',
      customer: {
        customer_id: customer.customer_id,
        name: customer.name
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};