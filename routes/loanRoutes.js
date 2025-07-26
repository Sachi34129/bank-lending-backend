const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');

router.post('/', loanController.createLoan);
router.post('/:loan_id/payments', loanController.recordPayment);
router.get('/:loan_id/ledger', loanController.viewLedger);

module.exports = router;