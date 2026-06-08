const express = require('express');
const accessoriesController = require('../controller/accessoriesController');
const { authMiddleware, checkPermission } = require('../middleware/auth');
const upload = require('../middleware/imageUpload');

const router = express.Router();

// View routes protected by view permissions
router.get('/', authMiddleware, checkPermission('accessories_view'), (req, res, next) => accessoriesController.getAllAccessories(req, res, next));
router.get('/:id', authMiddleware, checkPermission('accessories_view'), (req, res, next) => accessoriesController.getAccessory(req, res, next));

// Operational routes
router.post('/create', authMiddleware, checkPermission('accessories_create'), upload.single('imageUrl'), (req, res, next) => accessoriesController.createAccessory(req, res, next));
router.put('/:id', authMiddleware, checkPermission('accessories_edit'), upload.single('imageUrl'), (req, res, next) => accessoriesController.updateAccessory(req, res, next));
router.patch('/:id/quantity', authMiddleware, checkPermission('accessories_updateQuantity'), (req, res, next) => accessoriesController.updateQuantity(req, res, next));
router.delete('/:id', authMiddleware, checkPermission('accessories_delete'), (req, res, next) => accessoriesController.deleteAccessory(req, res, next));

module.exports = router;