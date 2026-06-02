const express = require('express');
const discountController = require('../controller/discountController');
const { authMiddleware, adminCheck } = require('../middleware/auth');

const router = express.Router();

router.get('/', (req, res, next) => discountController.getAllDiscounts(req, res, next));
router.get('/active', authMiddleware, (req, res, next) => discountController.getActiveDiscounts(req, res, next));
router.get('/:id', authMiddleware, (req, res, next) => discountController.getDiscount(req, res, next));

router.post('/create', authMiddleware, adminCheck, (req, res, next) => discountController.createDiscount(req, res, next));
router.put('/:id', authMiddleware, adminCheck, (req, res, next) => discountController.updateDiscount(req, res, next));
router.delete('/:id', authMiddleware, adminCheck, (req, res, next) => discountController.deleteDiscount(req, res, next));

module.exports = router;
