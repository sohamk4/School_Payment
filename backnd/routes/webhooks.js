const express = require('express');
const router = express.Router();
const { handelwebhook } = require('../controllers/webhookController');
const { authenticateJWT } = require('../middleware/auth');


// Wwebhook endpoint
router.post('/webhook', authenticateJWT, handelwebhook);
module.exports = router;