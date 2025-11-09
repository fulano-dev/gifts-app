const express = require('express');
const router = express.Router();
const paymentsController = require('../controllers/paymentsController');
const { authMiddleware, coupleOrAdminMiddleware } = require('../middleware/auth');

// Rotas públicas
router.post('/create', paymentsController.createPayment);
router.post('/webhook', paymentsController.paymentWebhook);

// Rotas autenticadas
router.get('/', authMiddleware, coupleOrAdminMiddleware, paymentsController.listPurchases);
router.get('/summary', authMiddleware, coupleOrAdminMiddleware, paymentsController.getFinancialSummary);

module.exports = router;
