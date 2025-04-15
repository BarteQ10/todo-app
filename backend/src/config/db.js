/**
 * Database and authentication configuration
 * Contains database connection settings and JWT secret
 */
module.exports = {
  dbFile: process.env.NODE_ENV === 'test' 
    ? './todo-test.db' 
    : './todo.db',
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key'
};