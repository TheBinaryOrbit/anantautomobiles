const express = require('express');
const bikeModelController = require('../controller/bikeModelController');
const { authMiddleware, checkPermission } = require('../middleware/auth');
const upload = require('../middleware/imageUpload');

const router = express.Router();

// Image is mandatory, the brochure PDF is optional
const modelUpload = upload.fields([
  { name: 'imageUrl', maxCount: 1 },
  { name: 'brochureUrl', maxCount: 1 },
]);

// View routes protected by view permissions
router.get('/', (req, res, next) => bikeModelController.getAllBikeModels(req, res, next));
router.get('/:id', authMiddleware, checkPermission('bikeModel_view'), (req, res, next) => bikeModelController.getBikeModel(req, res, next));

// Operational routes
router.post('/create', authMiddleware, checkPermission('bikeModel_create'), modelUpload, (req, res, next) => bikeModelController.createBikeModel(req, res, next));
router.put('/:id', authMiddleware, checkPermission('bikeModel_edit'), modelUpload, (req, res, next) => bikeModelController.updateBikeModel(req, res, next));
router.delete('/:id', authMiddleware, checkPermission('bikeModel_delete'), (req, res, next) => bikeModelController.deleteBikeModel(req, res, next));

module.exports = router;