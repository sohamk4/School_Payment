const express = require('express');
const router = express.Router();
const { login, logout, getSession } = require('../controllers/authController');
const { authenticateJWT } = require('../middleware/auth');

router.post('/login', login);

router.post('/logout', authenticateJWT, logout);
router.get('/session', authenticateJWT, getSession);

module.exports = router;