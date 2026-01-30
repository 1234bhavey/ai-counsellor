const jwt = require('jsonwebtoken');
const { findUserById } = require('../utils/database');

const auth = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await findUserById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }
    
    // Map database column names to JavaScript property names and include role
    req.user = {
      ...user,
      role: user.role || 'student', // Default to student if no role set
      onboardingCompleted: user.onboarding_completed
    };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = auth;