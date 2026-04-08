const express = require('express');
const accessoriesController = require('../controller/accessoriesController');
const { authMiddleware, adminCheck } = require('../middleware/auth');
const upload = require('../middleware/imageUpload');

const router = express.Router();

// Public routes - GET
router.get('/', (req, res, next) => accessoriesController.getAllAccessories(req, res, next));
router.get('/:id', (req, res, next) => accessoriesController.getAccessory(req, res, next));

// Admin protected routes
router.post('/create', authMiddleware, adminCheck, upload.single('imageUrl'), (req, res, next) => accessoriesController.createAccessory(req, res, next));
router.put('/:id', authMiddleware, adminCheck, upload.single('imageUrl'), (req, res, next) => accessoriesController.updateAccessory(req, res, next));
router.patch('/:id/quantity', authMiddleware, adminCheck, (req, res, next) => accessoriesController.updateQuantity(req, res, next));
router.delete('/:id', authMiddleware, adminCheck, (req, res, next) => accessoriesController.deleteAccessory(req, res, next));

module.exports = router;
