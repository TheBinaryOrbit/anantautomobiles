const express = require('express');
const bikeController = require('../controller/bikeController');
const { authMiddleware, adminCheck } = require('../middleware/auth');

const router = express.Router();

// Public routes - GET
router.get('/', (req, res, next) => bikeController.getAllBikes(req, res, next));
router.get('/:id', (req, res, next) => bikeController.getBike(req, res, next));

// Admin protected routes
router.post('/create', authMiddleware, adminCheck, (req, res, next) => bikeController.createBike(req, res, next));
router.put('/:id', authMiddleware, adminCheck, (req, res, next) => bikeController.updateBike(req, res, next));
router.delete('/:id', authMiddleware, adminCheck, (req, res, next) => bikeController.deleteBike(req, res, next));

// Mark bike as booked (admin protected)
router.patch('/:id/book', authMiddleware, adminCheck, (req, res, next) => bikeController.markBikeAsBooked(req, res, next));

module.exports = router;
