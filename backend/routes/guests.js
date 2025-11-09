const express = require('express');
const router = express.Router();
const guestsController = require('../controllers/guestsController');
const { authMiddleware, coupleOrAdminMiddleware } = require('../middleware/auth');

// Rotas públicas
router.get('/search', guestsController.listGuests);
router.post('/confirm', guestsController.confirmPresence);

// Rotas autenticadas
router.get('/', authMiddleware, coupleOrAdminMiddleware, guestsController.listGuests);
router.get('/confirmed', authMiddleware, coupleOrAdminMiddleware, guestsController.listConfirmedGuests);
router.get('/:id', authMiddleware, coupleOrAdminMiddleware, guestsController.getGuest);
router.post('/', authMiddleware, coupleOrAdminMiddleware, guestsController.createGuest);
router.put('/:id', authMiddleware, coupleOrAdminMiddleware, guestsController.updateGuest);
router.delete('/:id', authMiddleware, coupleOrAdminMiddleware, guestsController.deleteGuest);

module.exports = router;
