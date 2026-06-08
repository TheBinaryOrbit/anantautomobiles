const express = require('express');
const customerController = require('../controller/customerController');
const { authMiddleware, checkPermission } = require('../middleware/auth');

const router = express.Router();

// View routes protected by view permissions
router.get('/search', authMiddleware, checkPermission('customer_view'), (req, res, next) => customerController.searchCustomers(req, res, next));
router.get('/', authMiddleware, checkPermission('customer_view'), (req, res, next) => customerController.getAllCustomers(req, res, next));
router.get('/:id', authMiddleware, checkPermission('customer_view'), (req, res, next) => customerController.getCustomer(req, res, next));

// Operational routes
router.post('/create', authMiddleware, checkPermission('customer_create'), (req, res, next) => customerController.createCustomer(req, res, next));
router.put('/:id', authMiddleware, checkPermission('customer_edit'), (req, res, next) => customerController.updateCustomer(req, res, next));
router.delete('/:id', authMiddleware, checkPermission('customer_delete'), (req, res, next) => customerController.deleteCustomer(req, res, next));

module.exports = router;