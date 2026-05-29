const express = require('express');
const salesController = require('../controller/salesController');
const { authMiddleware, adminCheck } = require('../middleware/auth');

const router = express.Router();

// Public routes - GET
router.get('/', (req, res, next) => salesController.getAllSales(req, res, next));
router.get('/:id', (req, res, next) => salesController.getSale(req, res, next));

// Admin protected routes
router.post('/create', authMiddleware, adminCheck, (req, res, next) => salesController.createSale(req, res, next));
router.get('/:id/pdi-slip', authMiddleware, adminCheck, (req, res, next) => salesController.generatePDISlip(req, res, next));
router.patch('/items/:id/assign-bike', authMiddleware, adminCheck, (req, res, next) => salesController.assignBike(req, res, next));
router.patch('/:id/status', authMiddleware, adminCheck, (req, res, next) => salesController.updateSaleStatus(req, res, next));
router.patch('/:id/pending', authMiddleware, adminCheck, (req, res, next) => salesController.updatePendingAmount(req, res, next));
router.delete('/:id', authMiddleware, adminCheck, (req, res, next) => salesController.deleteSale(req, res, next));

module.exports = router;
