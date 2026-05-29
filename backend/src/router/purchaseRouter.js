const express = require('express');
const purchaseController = require('../controller/purchaseController');
const { authMiddleware, adminCheck } = require('../middleware/auth');

const router = express.Router();

// Admin protected routes
router.get('/', authMiddleware, adminCheck, (req, res, next) => purchaseController.getAllPurchases(req, res, next));
router.get('/:id', authMiddleware, adminCheck, (req, res, next) => purchaseController.getPurchase(req, res, next));
router.post('/create', authMiddleware, adminCheck, (req, res, next) => purchaseController.createPurchase(req, res, next));
router.delete('/:id', authMiddleware, adminCheck, (req, res, next) => purchaseController.deletePurchase(req, res, next));

module.exports = router;
