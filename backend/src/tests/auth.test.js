const request = require('supertest');
const { db, init } = require('../models/db');
const app = require('../server');
const { dbFile } = require('../config/db');
const fs = require('fs');

// Set test database path
process.env.NODE_ENV = 'test';

// Mock the config/db to use in-memory database and test JWT secret
jest.mock('../config/db', () => ({
  dbFile: ':memory:',
  JWT_SECRET: 'testsecret'
}));

describe('Authentication API Tests', () => {
  beforeAll((done) => {
    // Delete test database if exists
    if (fs.existsSync(dbFile)) {
      fs.unlinkSync(dbFile);
    }
    // Initialize database
    init(); 
    
    // Check for table creation
    const checkTable = () => {
      db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'", 
        (err, row) => {
          if (err) return done(err);
          if (row) done();
          else setTimeout(checkTable, 50);
        }
      );
    };
    checkTable();
  });

  afterEach((done) => {
    // Clear all data after each test
    db.run('DELETE FROM todos', (err) => {
      if (err) return done(err);
      db.run('DELETE FROM users', done);
    });
  });

  afterAll((done) => {
    // Close the database connection
    db.close(done);
  });

  describe('POST /api/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/register')
        .send({ username: 'user1', password: 'pass1' });
      
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('userId');
      expect(res.body).toHaveProperty('token');
    });

    it('should return 400 for missing username/password', async () => {
      const res1 = await request(app)
        .post('/api/register')
        .send({ username: 'user1' });
      expect(res1.statusCode).toBe(400);

      const res2 = await request(app)
        .post('/api/register')
        .send({ password: 'pass1' });
      expect(res2.statusCode).toBe(400);
    });

    it('should return 409 for duplicate username', async () => {
      // First registration
      await request(app)
        .post('/api/register')
        .send({ username: 'user1', password: 'pass1' });

      // Duplicate registration
      const res = await request(app)
        .post('/api/register')
        .send({ username: 'user1', password: 'pass1' });
      
      expect(res.statusCode).toBe(409);
      expect(res.body.error).toBe('Username already exists');
    });

    it('should return 500 when database query fails during user check', async () => {
      // Mock the db.get method to simulate a database error
      const originalGet = db.get;
      db.get = jest.fn((query, params, callback) => {
        callback(new Error('Database query failed'), null);
      });

      const res = await request(app)
        .post('/api/register')
        .send({ username: 'user1', password: 'pass1' });
      
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Database query failed');

      // Restore the original method
      db.get = originalGet;
    });

    it('should return 500 when database insert fails', async () => {
      // Mock the db.run method to simulate a database error during insert
      const originalRun = db.run;
      db.run = jest.fn((query, params, callback) => {
        callback(new Error('Database insert failed'));
      });

      const res = await request(app)
        .post('/api/register')
        .send({ username: 'user1', password: 'pass1' });
      
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Database insert failed');

      // Restore the original method
      db.run = originalRun;
    });
  });

  describe('POST /api/login', () => {
    beforeEach(async () => {
      // Register a user to test login
      await request(app)
        .post('/api/register')
        .send({ username: 'user1', password: 'pass1' });
    });

    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({ username: 'user1', password: 'pass1' });
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.message).toBe('Login successful');
    });

    it('should return 400 for lack of user', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({ password: 'wrongpass' });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Username and password are required');
    });

    it('should return 400 for lack of password', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({ username: 'user1' });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Username and password are required');
    });

    it('should return 401 for invalid password', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({ username: 'user1', password: 'wrongpass' });
      
      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBe('Invalid username or password');
    });

    it('should return 401 for non-existent user', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({ username: 'nouser', password: 'pass1' });
      
      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBe('Invalid username or password');
    });

    it('should return 500 when database query fails during login', async () => {
      // Mock the db.get method to simulate a database error
      const originalGet = db.get;
      db.get = jest.fn((query, params, callback) => {
        callback(new Error('Database query failed'), null);
      });

      const res = await request(app)
        .post('/api/login')
        .send({ username: 'user1', password: 'pass1' });
      
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Database query failed');

      // Restore the original method
      db.get = originalGet;
    });
  });
});