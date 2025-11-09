const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Rotas públicas
router.post('/login', authController.login);

// Rotas autenticadas
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, authController.updateProfile);

// Rotas de admin
router.get('/users', authMiddleware, adminMiddleware, authController.listUsers);
router.post('/users', authMiddleware, adminMiddleware, authController.createUser);
router.delete('/users/:id', authMiddleware, adminMiddleware, authController.deleteUser);

module.exports = router;
