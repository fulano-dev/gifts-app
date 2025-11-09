const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Rotas públicas
router.get('/wedding', settingsController.getWeddingInfo);

// Rotas autenticadas
router.get('/', authMiddleware, settingsController.getSettings);

// Rotas de admin
router.put('/', authMiddleware, adminMiddleware, settingsController.updateSetting);

module.exports = router;
