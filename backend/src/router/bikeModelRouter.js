const express = require('express');
const bikeModelController = require('../controller/bikeModelController');
const { authMiddleware, adminCheck } = require('../middleware/auth');
const upload = require('../middleware/imageUpload');

const router = express.Router();

// Public routes - GET
router.get('/', (req, res, next) => bikeModelController.getAllBikeModels(req, res, next));
router.get('/:id', (req, res, next) => bikeModelController.getBikeModel(req, res, next));

// Admin protected routes
router.post('/create', authMiddleware, adminCheck, upload.single('imageUrl'), (req, res, next) => bikeModelController.createBikeModel(req, res, next));
router.put('/:id', authMiddleware, adminCheck, upload.single('imageUrl'), (req, res, next) => bikeModelController.updateBikeModel(req, res, next));
router.delete('/:id', authMiddleware, adminCheck, (req, res, next) => bikeModelController.deleteBikeModel(req, res, next));

module.exports = router;
