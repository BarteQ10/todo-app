/**
 * Authentication controller module
 * Handles user registration and login functionality
 */
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { db } = require('../models/db');
const { JWT_SECRET } = require('../config/db');

/**
 * Register a new user
 * Creates user in database with hashed password and returns JWT token
 * 
 * @param {Object} req - Express request object with username and password in body
 * @param {Object} res - Express response object
 * @returns {Object} Response with user ID and token or error message
 */
const register = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    // Check if user exists
    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (user) {
        return res.status(409).json({ error: 'Username already exists' });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Insert user
      db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        
        const token = jwt.sign({ id: this.lastID, username }, JWT_SECRET, { expiresIn: '24h' });
        
        res.status(201).json({ message: 'User registered successfully', userId: this.lastID, token });
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Login existing user
 * Validates credentials and returns JWT token on success
 * 
 * @param {Object} req - Express request object with username and password in body
 * @param {Object} res - Express response object
 * @returns {Object} Response with user ID and token or error message
 */
const login = (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }
      
      const validPassword = await bcrypt.compare(password, user.password);
      
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }
      
      const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
      
      res.json({ message: 'Login successful', userId: user.id, token });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  register,
  login
};