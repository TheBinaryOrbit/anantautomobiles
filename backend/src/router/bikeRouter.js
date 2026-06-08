const express = require('express');
const bikeController = require('../controller/bikeController');
const { authMiddleware, checkPermission } = require('../middleware/auth');

const router = express.Router();

// View routes protected by view permissions
router.get('/', authMiddleware, checkPermission('bike_view'), (req, res, next) => bikeController.getAllBikes(req, res, next));
router.get('/:id', authMiddleware, checkPermission('bike_view'), (req, res, next) => bikeController.getBike(req, res, next));

// Operational routes
router.post('/create', authMiddleware, checkPermission('bike_create'), (req, res, next) => bikeController.createBike(req, res, next));
router.put('/:id', authMiddleware, checkPermission('bike_edit'), (req, res, next) => bikeController.updateBike(req, res, next));
router.delete('/:id', authMiddleware, checkPermission('bike_delete'), (req, res, next) => bikeController.deleteBike(req, res, next));

// Status updates
router.patch('/:id/book', authMiddleware, checkPermission('bike_markBooked'), (req, res, next) => bikeController.markBikeAsBooked(req, res, next));

module.exports = router;