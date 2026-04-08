const express = require('express');
const supplierController = require('../controller/supplierController');
const { authMiddleware, adminCheck } = require('../middleware/auth');

const router = express.Router();

// Public routes - GET
router.get('/', (req, res, next) => supplierController.getAllSuppliers(req, res, next));
router.get('/:id', (req, res, next) => supplierController.getSupplier(req, res, next));

// Admin protected routes
router.post('/create', authMiddleware, adminCheck, (req, res, next) => supplierController.createSupplier(req, res, next));
router.put('/:id', authMiddleware, adminCheck, (req, res, next) => supplierController.updateSupplier(req, res, next));
router.delete('/:id', authMiddleware, adminCheck, (req, res, next) => supplierController.deleteSupplier(req, res, next));

module.exports = router;
