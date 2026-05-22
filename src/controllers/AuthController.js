const User = require('../models/User');
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

class AuthController {
  static async register(req, res) {
    try {
      const { username, password, email } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
      }

      // Check if user exists
      const existingUser = await User.findByUsername(username);
      if (existingUser) {
        return res.status(409).json({ error: 'User already exists' });
      }

      // Create user
      const userId = await User.create(username, password, email || null);
      const token = jwt.sign({ id: userId, username }, SECRET_KEY, { expiresIn: '24h' });

      res.status(201).json({
        message: 'Account created successfully',
        user: { id: userId, username },
        token
      });
    } catch (err) {
      console.error('Register error:', err);
      res.status(500).json({ error: 'Registration failed' });
    }
  }

  static async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
      }

      const user = await User.findByUsername(username);
      if (!user) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      const isPasswordValid = await User.verifyPassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '24h' });

      res.json({
        message: 'Login successful',
        user: { id: user.id, username: user.username, actor_id: user.actor_id || null },
        token
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Login failed' });
    }
  }

  static async getUserInfo(req, res) {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        user: {
          id: user.id,
          username: user.username,
          actor_id: user.actor_id,
          email: user.email
        }
      });
    } catch (err) {
      console.error('Get user info error:', err);
      res.status(500).json({ error: 'Failed to get user info' });
    }
  }

  static async getAllUsers(req, res) {
    try {
      const users = await User.getAll();
      res.json({ users });
    } catch (err) {
      console.error('Get all users error:', err);
      res.status(500).json({ error: 'Failed to get users' });
    }
  }
}

module.exports = AuthController;
