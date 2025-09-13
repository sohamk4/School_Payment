const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const csrf = require('csurf');
require('dotenv').config();
const cookieParser = require('cookie-parser');

const connectDB = require('./config/database');
const paymentRoutes = require('./routes/payments');
const webhookRoutes = require('./routes/webhooks');
const authRoutes = require('./routes/auth');
const { authenticateJWT } = require('./middleware/auth');

const app = express();
const PORT = 5000;

connectDB();
app.use(cookieParser());
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000','https://effervescent-malabi-1d0307.netlify.app'],
  credentials: true
}));

const csrfProtection = csrf({
  cookie: {
    key: '_csrf',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
});

app.use(bodyParser.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

app.use(express.static(__dirname));

app.use(csrfProtection);

app.get('/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

app.use('/api', paymentRoutes);
app.use('/webhooks', webhookRoutes);
app.use('/auth', authRoutes);

app.get('/check',(req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Server is running'
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

app.use((error, req, res, next) => {
  if (error.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({
      success: false,
      message: 'Invalid CSRF token'
    });
  }
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: error.message
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;