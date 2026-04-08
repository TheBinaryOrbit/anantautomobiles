const bikeModelService = require('../services/bikeModelService');
const { ApiResponse } = require('../utils/apiResponse');

class BikeModelController {
  async createBikeModel(req, res, next) {
    try {
      if (!req.file) {
        return ApiResponse.badRequest(res, 'Image file is required');
      }

      const bikeModel = await bikeModelService.createBikeModel(req.body, req.file);
      return ApiResponse.created(res, 'BikeModel created successfully', bikeModel);
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

  async updateBikeModel(req, res, next) {
    try {
      const { id } = req.params;

      if (!id) {
        return ApiResponse.badRequest(res, 'BikeModel ID is required');
      }

      const bikeModel = await bikeModelService.updateBikeModel(id, req.body, req.file);
      return ApiResponse.success(res, 'BikeModel updated successfully', bikeModel, 200);
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

  async deleteBikeModel(req, res, next) {
    try {
      const { id } = req.params;

      if (!id) {
        return ApiResponse.badRequest(res, 'BikeModel ID is required');
      }

      await bikeModelService.deleteBikeModel(id);
      return ApiResponse.success(res, 'BikeModel deleted successfully');
    } catch (error) {
      if (error.statusCode === 404) {
        return ApiResponse.notFound(res, error.message);
      }
      return ApiResponse.badRequest(res, error.message);
    }
  }

  async getBikeModel(req, res, next) {
    try {
      const { id } = req.params;

      if (!id) {
        return ApiResponse.badRequest(res, 'BikeModel ID is required');
      }

      const bikeModel = await bikeModelService.getBikeModel(id);
      return ApiResponse.success(res, 'BikeModel retrieved successfully', bikeModel, 200);
    } catch (error) {
      if (error.statusCode === 404) {
        return ApiResponse.notFound(res, error.message);
      }
      return ApiResponse.badRequest(res, error.message);
    }
  }

  async getAllBikeModels(req, res, next) {
    try {
      const bikeModels = await bikeModelService.getAllBikeModels();
      return ApiResponse.success(res, 'BikeModels retrieved successfully', bikeModels, 200);
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }
}

module.exports = new BikeModelController();
