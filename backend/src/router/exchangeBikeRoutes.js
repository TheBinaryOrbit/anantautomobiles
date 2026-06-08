const express = require('express');
const exchangeBikeController = require('../controller/exchangeBikeController');
const { authMiddleware, checkPermission } = require('../middleware/auth');

const router = express.Router();

// View routes protected by view permissions
router.get('/', authMiddleware, checkPermission('exchange_view'), (req, res, next) => exchangeBikeController.getAllExchangeBikes(req, res, next));
router.get('/:id', authMiddleware, checkPermission('exchange_view'), (req, res, next) => exchangeBikeController.getExchangeBike(req, res, next));

// Operational routes
router.post('/create', authMiddleware, checkPermission('exchange_create'), (req, res, next) => exchangeBikeController.createExchangeBike(req, res, next));
router.put('/:id', authMiddleware, checkPermission('exchange_edit'), (req, res, next) => exchangeBikeController.updateExchangeBike(req, res, next));
router.delete('/:id', authMiddleware, checkPermission('exchange_delete'), (req, res, next) => exchangeBikeController.deleteExchangeBike(req, res, next));

module.exports = router;