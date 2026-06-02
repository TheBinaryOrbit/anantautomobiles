const express = require('express');
const exchangeBikeController = require('../controller/exchangeBikeController');
const { authMiddleware, adminCheck } = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, (req, res, next) => exchangeBikeController.getAllExchangeBikes(req, res, next));
router.get('/:id', authMiddleware, (req, res, next) => exchangeBikeController.getExchangeBike(req, res, next));

router.post('/create', authMiddleware, adminCheck, (req, res, next) => exchangeBikeController.createExchangeBike(req, res, next));
router.put('/:id', authMiddleware, adminCheck, (req, res, next) => exchangeBikeController.updateExchangeBike(req, res, next));
router.delete('/:id', authMiddleware, adminCheck, (req, res, next) => exchangeBikeController.deleteExchangeBike(req, res, next));

module.exports = router;