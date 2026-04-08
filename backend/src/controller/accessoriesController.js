const accessoriesService = require('../services/accessoriesService');
const { ApiResponse } = require('../utils/apiResponse');

class AccessoriesController {
  async createAccessory(req, res, next) {
    try {
      if (!req.file) {
        return ApiResponse.badRequest(res, 'Image file is required');
      }

      const accessory = await accessoriesService.createAccessory(req.body, req.file);
      return ApiResponse.created(res, 'Accessory created successfully', accessory);
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

  async updateAccessory(req, res, next) {
    try {
      const { id } = req.params;

      if (!id) {
        return ApiResponse.badRequest(res, 'Accessory ID is required');
      }

      const accessory = await accessoriesService.updateAccessory(id, req.body, req.file);
      return ApiResponse.success(res, 'Accessory updated successfully', accessory, 200);
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

  async updateQuantity(req, res, next) {
    try {
      const { id } = req.params;
      const { quantityInStock } = req.body;

      if (!id) {
        return ApiResponse.badRequest(res, 'Accessory ID is required');
      }

      if (quantityInStock === undefined) {
        return ApiResponse.badRequest(res, 'Quantity in Stock is required');
      }

      const accessory = await accessoriesService.updateQuantity(id, quantityInStock);
      return ApiResponse.success(res, 'Quantity updated successfully', accessory, 200);
    } catch (error) {
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

  async deleteAccessory(req, res, next) {
    try {
      const { id } = req.params;

      if (!id) {
        return ApiResponse.badRequest(res, 'Accessory ID is required');
      }

      await accessoriesService.deleteAccessory(id);
      return ApiResponse.success(res, 'Accessory deleted successfully');
    } catch (error) {
      if (error.statusCode === 404) {
        return ApiResponse.notFound(res, error.message);
      }
      return ApiResponse.badRequest(res, error.message);
    }
  }

  async getAccessory(req, res, next) {
    try {
      const { id } = req.params;

      if (!id) {
        return ApiResponse.badRequest(res, 'Accessory ID is required');
      }

      const accessory = await accessoriesService.getAccessory(id);
      return ApiResponse.success(res, 'Accessory retrieved successfully', accessory, 200);
    } catch (error) {
      if (error.statusCode === 404) {
        return ApiResponse.notFound(res, error.message);
      }
      return ApiResponse.badRequest(res, error.message);
    }
  }

  async getAllAccessories(req, res, next) {
    try {
      const accessories = await accessoriesService.getAllAccessories();
      return ApiResponse.success(res, 'Accessories retrieved successfully', accessories, 200);
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }
}

module.exports = new AccessoriesController();
