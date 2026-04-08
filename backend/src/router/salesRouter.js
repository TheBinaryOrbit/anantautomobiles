const express = require('express');
const salesController = require('../controller/salesController');
const { authMiddleware, adminCheck } = require('../middleware/auth');

const router = express.Router();

// Public routes - GET
router.get('/', (req, res, next) => salesController.getAllSales(req, res, next));
router.get('/:id', (req, res, next) => salesController.getSale(req, res, next));

// Admin protected routes
router.post('/create', authMiddleware, adminCheck, (req, res, next) => salesController.createSale(req, res, next));
router.patch('/:id/status', authMiddleware, adminCheck, (req, res, next) => salesController.updateSaleStatus(req, res, next));

module.exports = router;
