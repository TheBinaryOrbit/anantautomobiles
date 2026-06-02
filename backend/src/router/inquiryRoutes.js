const express = require('express');
const inquiryController = require('../controller/inquiryController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Public submission endpoints (Frontend website access)
router.post('/service', (req, res) => inquiryController.createServiceInquiry(req, res));
router.post('/sales', (req, res) => inquiryController.createSalesInquiry(req, res));

// Protected internal endpoints (Dashboard admin view)
router.get('/service', authMiddleware, (req, res) => inquiryController.getAllServiceInquiries(req, res));
router.get('/sales', authMiddleware, (req, res) => inquiryController.getAllSalesInquiries(req, res));

module.exports = router;