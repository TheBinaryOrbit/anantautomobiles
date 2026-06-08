const express = require('express');
const salesController = require('../controller/salesController');
const { authMiddleware, checkPermission } = require('../middleware/auth');

const router = express.Router();

// View routes protected by view permissions
router.get('/', authMiddleware, checkPermission('sales_view'), (req, res, next) => salesController.getAllSales(req, res, next));
router.get('/:id', authMiddleware, checkPermission('sales_view'), (req, res, next) => salesController.getSale(req, res, next));
router.get('/:id/pdi-slip', authMiddleware, checkPermission('sales_view'), (req, res, next) => salesController.generatePDISlip(req, res, next));

// Operational and checkout mutative routes
router.post('/create', authMiddleware, checkPermission('sales_create'), (req, res, next) => salesController.createSale(req, res, next));
router.patch('/items/:id/assign-bike', authMiddleware, checkPermission('sales_edit'), (req, res, next) => salesController.assignBike(req, res, next));
router.patch('/:id/status', authMiddleware, checkPermission('sales_updateStatus'), (req, res, next) => salesController.updateSaleStatus(req, res, next));
router.patch('/:id/pending', authMiddleware, checkPermission('sales_edit'), (req, res, next) => salesController.updatePendingAmount(req, res, next));
router.delete('/:id', authMiddleware, checkPermission('sales_delete'), (req, res, next) => salesController.deleteSale(req, res, next));

router.post('/items/:id/exchange', authMiddleware, checkPermission('sales_edit'), (req, res, next) => salesController.exchangeItem(req, res, next));

module.exports = router;