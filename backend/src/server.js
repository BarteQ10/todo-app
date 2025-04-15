/**
 * Main application entry point
 * Initializes Express server with routes and middleware
 */
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const todoRoutes = require('./routes/todoRoutes');
const db = require('./models/db');

// Initialize application
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
db.init();

// Connect routes
app.use('/api', authRoutes);
app.use('/api', todoRoutes);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;