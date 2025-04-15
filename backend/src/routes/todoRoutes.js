/**
 * Todo routes module
 * Defines API endpoints for todo CRUD operations
 * All routes require authentication
 */
const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const {
  createTodo,
  getAllTodos,
  getTodoById,
  updateTodo,
  deleteTodo
} = require('../controllers/todoController');

const router = express.Router();

// Todo routes (all require authentication)
router.post('/todos', authenticateToken, createTodo);
router.get('/todos', authenticateToken, getAllTodos);
router.get('/todos/:id', authenticateToken, getTodoById);
router.put('/todos/:id', authenticateToken, updateTodo);
router.delete('/todos/:id', authenticateToken, deleteTodo);

module.exports = router;