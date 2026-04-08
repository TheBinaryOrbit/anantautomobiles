const express = require('express');
const customerController = require('../controller/customerController');
const { authMiddleware, adminCheck } = require('../middleware/auth');

const router = express.Router();

// Public routes - GET
router.get('/search', (req, res, next) => customerController.searchCustomers(req, res, next));
router.get('/', (req, res, next) => customerController.getAllCustomers(req, res, next));
router.get('/:id', (req, res, next) => customerController.getCustomer(req, res, next));

// Admin protected routes
router.post('/create', authMiddleware, adminCheck, (req, res, next) => customerController.createCustomer(req, res, next));
router.put('/:id', authMiddleware, adminCheck, (req, res, next) => customerController.updateCustomer(req, res, next));
router.delete('/:id', authMiddleware, adminCheck, (req, res, next) => customerController.deleteCustomer(req, res, next));

module.exports = router;
