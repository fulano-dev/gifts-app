const express = require('express');
const router = express.Router();
const withdrawalsController = require('../controllers/withdrawalsController');
const { authMiddleware, adminMiddleware, coupleOrAdminMiddleware } = require('../middleware/auth');

// Rotas autenticadas (noivos e admin)
router.get('/', authMiddleware, coupleOrAdminMiddleware, withdrawalsController.listWithdrawals);
router.post('/', authMiddleware, coupleOrAdminMiddleware, withdrawalsController.requestWithdrawal);

// Rotas de admin
router.put('/:id', authMiddleware, adminMiddleware, withdrawalsController.processWithdrawal);

module.exports = router;
