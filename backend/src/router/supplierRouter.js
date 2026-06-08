const express = require('express');
const supplierController = require('../controller/supplierController');
const { authMiddleware, checkPermission } = require('../middleware/auth');

const router = express.Router();

// View routes protected by view permissions
router.get('/', authMiddleware, checkPermission('supplier_view'), (req, res, next) => supplierController.getAllSuppliers(req, res, next));
router.get('/:id', authMiddleware, checkPermission('supplier_view'), (req, res, next) => supplierController.getSupplier(req, res, next));

// Operational logistics configurations
router.post('/create', authMiddleware, checkPermission('supplier_create'), (req, res, next) => supplierController.createSupplier(req, res, next));
router.put('/:id', authMiddleware, checkPermission('supplier_edit'), (req, res, next) => supplierController.updateSupplier(req, res, next));
router.delete('/:id', authMiddleware, checkPermission('supplier_delete'), (req, res, next) => supplierController.deleteSupplier(req, res, next));

module.exports = router;