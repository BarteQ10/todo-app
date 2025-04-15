/**
 * Todo controller module
 * Handles CRUD operations for todo items
 */
const { db } = require('../models/db');

/**
 * Create a new todo item
 * Adds todo item to database for authenticated user
 * 
 * @param {Object} req - Express request object with todo details in body
 * @param {Object} res - Express response object
 * @returns {Object} Response with created todo item or error message
 */
const createTodo = (req, res) => {
  try {
    const { title, description, priority, due_date, status } = req.body;
    const user_id = req.user.id;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    db.run(
      'INSERT INTO todos (user_id, title, description, priority, due_date, status) VALUES (?, ?, ?, ?, ?, ?)',
      [user_id, title, description, priority, due_date, status],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        
        res.status(201).json({ 
          id: this.lastID,
          user_id,
          title,
          description,
          priority,
          due_date,
          status
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get all todo items for authenticated user
 * Retrieves all todos belonging to the authenticated user
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with array of todo items or error message
 */
const getAllTodos = (req, res) => {
  try {
    const user_id = req.user.id;
    
    db.all('SELECT * FROM todos WHERE user_id = ? ORDER BY created_at DESC', [user_id], (err, todos) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      res.json(todos);
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get a specific todo item by ID
 * Retrieves a single todo item if it belongs to the authenticated user
 * 
 * @param {Object} req - Express request object with todo ID in params
 * @param {Object} res - Express response object
 * @returns {Object} Response with todo item or error message
 */
const getTodoById = (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    
    db.get('SELECT * FROM todos WHERE id = ? AND user_id = ?', [id, user_id], (err, todo) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (!todo) {
        return res.status(404).json({ error: 'Todo not found' });
      }
      
      res.json(todo);
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update an existing todo item
 * Modifies a todo item if it belongs to the authenticated user
 * 
 * @param {Object} req - Express request object with todo ID in params and updated fields in body
 * @param {Object} res - Express response object
 * @returns {Object} Response with updated todo item or error message
 */
const updateTodo = (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, due_date } = req.body;
    const user_id = req.user.id;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    db.run(
      `UPDATE todos 
       SET title = ?, description = ?, status = ?, priority = ?, due_date = ? 
       WHERE id = ? AND user_id = ?`,
      [title, description, status, priority, due_date, id, user_id],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Todo not found or unauthorized' });
        }
        
        db.get('SELECT * FROM todos WHERE id = ?', [id], (err, todo) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          
          res.json(todo);
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Delete a todo item
 * Removes a todo item if it belongs to the authenticated user
 * 
 * @param {Object} req - Express request object with todo ID in params
 * @param {Object} res - Express response object
 * @returns {Object} Response with success message or error
 */
const deleteTodo = (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    
    db.run('DELETE FROM todos WHERE id = ? AND user_id = ?', [id, user_id], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Todo not found or unauthorized' });
      }
      
      res.json({ message: 'Todo deleted successfully' });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createTodo,
  getAllTodos,
  getTodoById,
  updateTodo,
  deleteTodo
};