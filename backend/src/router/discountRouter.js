const express = require('express');
const discountController = require('../controller/discountController');
const { authMiddleware, checkPermission } = require('../middleware/auth');
const upload = require('../middleware/imageUpload');

const router = express.Router();

// View routes protected by view permissions
router.get('/', authMiddleware, checkPermission('discounts_view'), (req, res, next) => discountController.getAllDiscounts(req, res, next));
router.get('/active', authMiddleware, checkPermission('discounts_view'), (req, res, next) => discountController.getActiveDiscounts(req, res, next));
router.get('/:id', authMiddleware, checkPermission('discounts_view'), (req, res, next) => discountController.getDiscount(req, res, next));

// Operational routes
router.post('/create', authMiddleware, checkPermission('discounts_create'), upload.single('image'), (req, res, next) => discountController.createDiscount(req, res, next));
router.put('/:id', authMiddleware, checkPermission('discounts_edit'), upload.single('image'), (req, res, next) => discountController.updateDiscount(req, res, next));
router.delete('/:id', authMiddleware, checkPermission('discounts_remove'), (req, res, next) => discountController.deleteDiscount(req, res, next));

module.exports = router;