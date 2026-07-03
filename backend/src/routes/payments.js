const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const { initiatePayment, verifyPayment, getPaymentStatus } = require('../controllers/paymentsController');

// Company initiates payment
router.post('/initiate', authenticate, authorize('company'), initiatePayment);

// Khalti redirects here after payment
router.get('/verify', verifyPayment);

// Check payment status for a report
router.get('/status/:report_id', authenticate, getPaymentStatus);

module.exports = router;