const express = require('express');
const AuthController = require('../controllers/AuthController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Public endpoints
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// Protected endpoints
router.get('/me', authMiddleware, AuthController.getUserInfo);
router.get('/users', authMiddleware, AuthController.getAllUsers);

module.exports = router;
