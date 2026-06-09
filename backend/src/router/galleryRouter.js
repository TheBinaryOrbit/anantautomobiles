const express = require('express');
const galleryController = require('../controller/galleryController');
const { authMiddleware, checkPermission } = require('../middleware/auth');
const upload = require('../middleware/imageUpload');

const router = express.Router();

// View route protected by view permission
router.get('/', (req, res, next) => galleryController.getAllGalleries(req, res, next));

// Operational routes
router.post('/create', authMiddleware, checkPermission('gallery_create'), upload.single('image'), (req, res, next) => galleryController.createGallery(req, res, next));
router.delete('/:id', authMiddleware, checkPermission('gallery_delete'), (req, res, next) => galleryController.deleteGallery(req, res, next));

module.exports = router;