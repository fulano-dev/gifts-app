const express = require('express');
const router = express.Router();
const experiencesController = require('../controllers/experiencesController');
const { authMiddleware, coupleOrAdminMiddleware } = require('../middleware/auth');

// Rotas públicas
router.get('/', experiencesController.listExperiences);
router.get('/:id', experiencesController.getExperience);

// Rotas autenticadas
router.post('/', authMiddleware, coupleOrAdminMiddleware, experiencesController.createExperience);
router.put('/:id', authMiddleware, coupleOrAdminMiddleware, experiencesController.updateExperience);
router.delete('/:id', authMiddleware, coupleOrAdminMiddleware, experiencesController.deleteExperience);

module.exports = router;
