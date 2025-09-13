const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../middleware/auth');
const { createPayment,createCollectRequest,getAllTransactions,getTransactions,getTransactionCustomer,getallnames,getTransactionStats } = require('../controllers/paymentController');

router.get('/transactions', getAllTransactions);
router.get('/allinstituename',getallnames);
router.get('/transac-stats',getTransactionStats);
router.get('/transactions/school/:schoolId',getTransactions);
router.get('/transaction-status/:custom_order_id',getTransactionCustomer);

router.post('/create-payment', authenticateJWT, createPayment);
router.get('/payment-status/:collect_request_id', authenticateJWT, createCollectRequest);

module.exports = router;    