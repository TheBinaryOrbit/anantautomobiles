const galleryService = require('../services/galleryService');
const { ApiResponse } = require('../utils/apiResponse');

class GalleryController {
  async createGallery(req, res, next) {
    try {
      if (!req.file) {
        return ApiResponse.badRequest(res, 'Image file is required');
      }

      const galleryItem = await galleryService.createGallery(req.body, req.file);
      return ApiResponse.created(res, 'Gallery item created successfully', galleryItem);
    } catch (error) {
      if (error.validationErrors) {
        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: error.message,
          errors: error.validationErrors,
        });
      }
      if (error.statusCode === 404) {
        return ApiResponse.notFound(res, error.message);
      }
      if (error.field) {
        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: error.message,
          field: error.field,
        });
      }
      return ApiResponse.badRequest(res, error.message);
    }
  }

  async deleteGallery(req, res, next) {
    try {
      const { id } = req.params;

      if (!id) {
        return ApiResponse.badRequest(res, 'Gallery ID is required');
      }

      await galleryService.deleteGallery(id);
      return ApiResponse.success(res, 'Gallery item deleted successfully');
    } catch (error) {
      if (error.statusCode === 404) {
        return ApiResponse.notFound(res, error.message);
      }
      return ApiResponse.badRequest(res, error.message);
    }
  }

  async getAllGalleries(req, res, next) {
    try {
      const galleryItems = await galleryService.getAllGalleries();
      return ApiResponse.success(res, 'Gallery items retrieved successfully', galleryItems, 200);
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }
}

module.exports = new GalleryController();