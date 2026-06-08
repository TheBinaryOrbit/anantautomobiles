const express = require('express');
const inquiryController = require('../controller/inquiryController');
const { authMiddleware, checkPermission } = require('../middleware/auth');

const router = express.Router();

// Public website access submission endpoints (No auth)
router.post('/service', (req, res) => inquiryController.createServiceInquiry(req, res));
router.post('/sales', (req, res) => inquiryController.createSalesInquiry(req, res));

// Protected internal endpoints (Dashboard admin view)
router.get('/service', authMiddleware, checkPermission('serviceInquiry_view'), (req, res) => inquiryController.getAllServiceInquiries(req, res));
router.get('/sales', authMiddleware, checkPermission('salesInquiry_view'), (req, res) => inquiryController.getAllSalesInquiries(req, res));

// Operational resolution updates
router.patch('/service/:id/resolve', authMiddleware, checkPermission('serviceInquiry_view'), (req, res) => inquiryController.updateServiceInquiryStatus(req, res));
router.patch('/sales/:id/resolve', authMiddleware, checkPermission('salesInquiry_view'), (req, res) => inquiryController.updateSalesInquiryStatus(req, res));

module.exports = router;