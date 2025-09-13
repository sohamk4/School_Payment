const jwt = require('jsonwebtoken');
require('dotenv').config();

const generateTokens = (user) => {
  if (!user) {
    throw new Error('User object is undefined');
  }
  
  console.log(user.username);
  return jwt.sign(
    { 
      school_id: user.username,
    },
    process.env.JWT_SECRET,
    { 
      expiresIn: '1h',
      issuer: process.env.APP_NAME,
      audience: user.username,
      algorithm: 'HS256'
    }
  );
};

const authenticateJWT = (req, res, next) => {
    const token = req.cookies?.token || req.headers['authorization']?.split(' ')[1];
  
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
  
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({
          success: false,
          message: 'Invalid or expired session'
        });
      }
      req.user = user;
      next();
    });
  };

// Middleware to verify 
const verifyCredentials = (req, res, next) => {
  const pgKey = req.headers['x-pg-key'];
  const apiKey = req.headers['x-api-key'];
  const schoolId = req.headers['x-school-id'];

  if (pgKey !== process.env.PG_KEY || 
      apiKey !== process.env.API_KEY || 
      schoolId !== process.env.SCHOOL_ID) {
    return res.status(401).json({ 
      success: false,
      error: 'Invalid payment gateway credentials' 
    });
  }
  
  req.raw = { pgKey, apiKey, schoolId };
  next();
};

const generateSignature = (payload) => {
  return jwt.sign(payload, process.env.PG_KEY, { algorithm: 'HS256' });
};
module.exports = { generateTokens,authenticateJWT,verifyCredentials, generateSignature };