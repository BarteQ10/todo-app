/**
 * Authentication routes module
 * Defines API endpoints for user registration and login
 */
const express = require('express');
const { register, login } = require('../controllers/authController');

const router = express.Router();

// Authentication routes
router.post('/register', register);
router.post('/login', login);

module.exports = router;