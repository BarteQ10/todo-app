/**
 * Authentication middleware module
 * Provides JWT token verification for protected routes
 */
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/db');

/**
 * Middleware to authenticate JWT token
 * Verifies the token from Authorization header and adds user data to request
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Forbidden: Invalid token' });
    }
    req.user = user;
    next();
  });
};

module.exports = {
  authenticateToken
};