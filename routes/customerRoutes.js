const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

// POST /customers - create a new customer
router.post('/', customerController.createCustomer);
router.get('/:customer_id/overview', customerController.getAccountOverview);

module.exports = router;