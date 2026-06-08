const express = require('express');
const purchaseController = require('../controller/purchaseController');
const { authMiddleware, checkPermission } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

// All purchase order transactional bookkeeping streams securely mapped
router.get('/', checkPermission('purchases_view'), (req, res, next) => purchaseController.getAllPurchases(req, res, next));
router.get('/:id', checkPermission('purchases_view'), (req, res, next) => purchaseController.getPurchase(req, res, next));
router.post('/create', checkPermission('purchases_create'), (req, res, next) => purchaseController.createPurchase(req, res, next));
router.delete('/:id', checkPermission('purchases_remove'), (req, res, next) => purchaseController.deletePurchase(req, res, next));

module.exports = router;