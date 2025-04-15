const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { db, init } = require('../models/db');
const app = require('../server');
const { JWT_SECRET, dbFile } = require('../config/db');
const fs = require('fs');
const path = require('path');

// Set test database path
process.env.NODE_ENV = 'test';

// Test users and tokens
let user1Token, user2Token;
const testUsers = [
  { id: 1, username: 'user1' },
  { id: 2, username: 'user2' }
];

// Test todos
const testTodos = [
  { id: 1, user_id: 1, title: 'User1 Todo1' },
  { id: 2, user_id: 1, title: 'User1 Todo2' },
  { id: 3, user_id: 2, title: 'User2 Todo1' }
];

beforeAll((done) => {
  // Delete test database if exists
  if (fs.existsSync(dbFile)) {
    try {
      fs.unlinkSync(dbFile);
    } catch (err) {
      if (err.code !== 'EBUSY') throw err;
      console.warn('Could not delete test database file, it may be locked');
    }
  }

  // Initialize database
  init();
  
  // Seed test data after tables are created
  const checkTable = () => {
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'", 
      async (err) => {
        if (err) return done(err);
        
        // Insert test users
        await db.run('DELETE FROM users');
        await db.run('DELETE FROM todos');
        
        // Insert test users (using plain text passwords for testing)
        await db.run(
          'INSERT INTO users (id, username, password) VALUES (?, ?, ?)',
          [1, 'user1', bcrypt.hashSync('pass1', 1)]
        );
        await db.run(
          'INSERT INTO users (id, username, password) VALUES (?, ?, ?)',
          [2, 'user2', bcrypt.hashSync('pass2', 1)]
        );

        // Insert test todos
        testTodos.forEach(async (todo) => {
          await db.run(
            'INSERT INTO todos (id, user_id, title) VALUES (?, ?, ?)',
            [todo.id, todo.user_id, todo.title]
          );
        });

        // Generate JWT tokens
        user1Token = jwt.sign(testUsers[0], JWT_SECRET);
        user2Token = jwt.sign(testUsers[1], JWT_SECRET);
        done();
      }
    );
  };
  checkTable();
});

afterAll((done) => {
  db.close(done);
});

describe('Authentication Middleware Tests', () => {
  it('should block access to protected routes without token', async () => {
    const res = await request(app).get('/api/todos');
    expect(res.statusCode).toBe(401);
  });

  it('should block access with invalid token', async () => {
    const res = await request(app)
      .get('/api/todos')
      .set('Authorization', 'Bearer invalidtoken');
    expect(res.statusCode).toBe(403);
  });
});

describe('Todo Controller Tests', () => {
  describe('GET /api/todos', () => {
    it('should return all todos for authenticated user', async () => {
      const res = await request(app)
        .get('/api/todos')
        .set('Authorization', `Bearer ${user1Token}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0]).toMatchObject({ title: 'User1 Todo1' });
    });
  });

  describe('POST /api/todos', () => {
    it('should create a new todo', async () => {
      const newTodo = {
        title: 'New Todo',
        description: 'Test description',
        priority: 'high'
      };

      const res = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${user1Token}`)
        .send(newTodo);

      expect(res.statusCode).toBe(201);
      expect(res.body).toMatchObject({
        user_id: 1,
        title: 'New Todo',
        priority: 'high'
      });
    });

    it('should return 400 when missing title', async () => {
      const res = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ description: 'Invalid todo' });
      
      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/todos/:id', () => {
    it('should return a specific todo', async () => {
      const res = await request(app)
        .get('/api/todos/1')
        .set('Authorization', `Bearer ${user1Token}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toMatchObject({ id: 1, title: 'User1 Todo1' });
    });

    it('should return 404 for other users todo', async () => {
      const res = await request(app)
        .get('/api/todos/3')
        .set('Authorization', `Bearer ${user1Token}`);
      
      expect(res.statusCode).toBe(404);
    });

    it('should return 404 for non-existent todo', async () => {
      const res = await request(app)
        .get('/api/todos/999')
        .set('Authorization', `Bearer ${user1Token}`);
      
      expect(res.statusCode).toBe(404);
    });
  });

  describe('PUT /api/todos/:id', () => {
    it('should update a todo', async () => {
      const updates = {
        title: 'Updated Title',
        status: 'completed',
        priority: 'low'
      };

      const res = await request(app)
        .put('/api/todos/1')
        .set('Authorization', `Bearer ${user1Token}`)
        .send(updates);

      expect(res.statusCode).toBe(200);
      expect(res.body).toMatchObject(updates);
    });

    it('should return 404 when updating other users todo', async () => {
      const res = await request(app)
        .put('/api/todos/3')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ title: 'Unauthorized Update' });
      
      expect(res.statusCode).toBe(404);
    });

    it('should return 400 when missing title', async () => {
      const res = await request(app)
        .put('/api/todos/1')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ title: '' });
      
      expect(res.statusCode).toBe(400);
    });
  });

  describe('DELETE /api/todos/:id', () => {
    it('should delete a todo', async () => {
      const res = await request(app)
        .delete('/api/todos/2')
        .set('Authorization', `Bearer ${user1Token}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toMatchObject({ message: 'Todo deleted successfully' });
    });

    it('should return 404 when deleting other users todo', async () => {
      const res = await request(app)
        .delete('/api/todos/3')
        .set('Authorization', `Bearer ${user1Token}`);
      
      expect(res.statusCode).toBe(404);
    });
  });
});


describe('Todo Controller Tests - Error Handling', () => {
    describe('Database Error Simulations', () => {
      let originalMethods;
  
      beforeAll(() => {
        // Save original database methods
        originalMethods = {
          run: db.run,
          get: db.get,
          all: db.all
        };
      });
  
      afterEach(() => {
        // Restore original database methods after each test
        db.run = originalMethods.run;
        db.get = originalMethods.get;
        db.all = originalMethods.all;
      });
  
      describe('POST /api/todos', () => {
        it('should return 500 when todo creation fails', async () => {
          // Mock db.run to fail
          db.run = jest.fn((query, params, callback) => {
            callback(new Error('Database insert failed'));
          });
  
          const res = await request(app)
            .post('/api/todos')
            .set('Authorization', `Bearer ${user1Token}`)
            .send({ title: 'Fail Todo' });
  
          expect(res.statusCode).toBe(500);
          expect(res.body.error).toBe('Database insert failed');
        });
      });
  
      describe('GET /api/todos', () => {
        it('should return 500 when fetching todos fails', async () => {
          // Mock db.all to fail
          db.all = jest.fn((query, params, callback) => {
            callback(new Error('Database query failed'));
          });
  
          const res = await request(app)
            .get('/api/todos')
            .set('Authorization', `Bearer ${user1Token}`);
  
          expect(res.statusCode).toBe(500);
          expect(res.body.error).toBe('Database query failed');
        });
      });
  
      describe('GET /api/todos/:id', () => {
        it('should return 500 when fetching single todo fails', async () => {
          // Mock db.get to fail
          db.get = jest.fn((query, params, callback) => {
            callback(new Error('Database query failed'));
          });
  
          const res = await request(app)
            .get('/api/todos/1')
            .set('Authorization', `Bearer ${user1Token}`);
  
          expect(res.statusCode).toBe(500);
          expect(res.body.error).toBe('Database query failed');
        });
      });
  
      describe('PUT /api/todos/:id', () => {
        it('should return 500 when todo update fails', async () => {
          // Mock db.run to fail
          db.run = jest.fn((query, params, callback) => {
            callback(new Error('Database update failed'));
          });
  
          const res = await request(app)
            .put('/api/todos/1')
            .set('Authorization', `Bearer ${user1Token}`)
            .send({ title: 'Updated Title' });
  
          expect(res.statusCode).toBe(500);
          expect(res.body.error).toBe('Database update failed');
        });
  
        it('should return 500 when fetching updated todo fails', async () => {
          // Mock db.get after update to fail
          db.get = jest.fn((query, params, callback) => {
            callback(new Error('Failed to fetch updated todo'));
          });
  
          const res = await request(app)
            .put('/api/todos/1')
            .set('Authorization', `Bearer ${user1Token}`)
            .send({ title: 'Updated Title' });
  
          expect(res.statusCode).toBe(500);
          expect(res.body.error).toBe('Failed to fetch updated todo');
        });
      });
  
      describe('DELETE /api/todos/:id', () => {
        it('should return 500 when todo deletion fails', async () => {
          // Mock db.run to fail
          db.run = jest.fn((query, params, callback) => {
            callback(new Error('Database deletion failed'));
          });
  
          const res = await request(app)
            .delete('/api/todos/1')
            .set('Authorization', `Bearer ${user1Token}`);
  
          expect(res.statusCode).toBe(500);
          expect(res.body.error).toBe('Database deletion failed');
        });
      });
    });
  
    
  });