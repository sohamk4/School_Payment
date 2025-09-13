const User = require('../models/User');
const { generateTokens } = require('../middleware/auth');

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = generateTokens(user);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        school_id: user.school_id
      }
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token');
  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
};

exports.getSession = (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      school_id: req.user.school_id,
      user_id: req.user.id
    }
  });
};