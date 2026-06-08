const bikeService = require('../services/bikeService');
const { ApiResponse } = require('../utils/apiResponse');

class BikeController {
  async createBike(req, res, next) {
    try {
      const bike = await bikeService.createBike(req.body);
      return ApiResponse.created(res, 'Bike created successfully', bike);
    } catch (error) {
      if (error.validationErrors) {
        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: error.message,
          errors: error.validationErrors,
        });
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

  async updateBike(req, res, next) {
    try {
      const { id } = req.params;

      if (!id) {
        return ApiResponse.badRequest(res, 'Bike ID is required');
      }

      const bike = await bikeService.updateBike(id, req.body);
      return ApiResponse.success(res, 'Bike updated successfully', bike, 200);
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

  async deleteBike(req, res, next) {
    try {
      const { id } = req.params;

      if (!id) {
        return ApiResponse.badRequest(res, 'Bike ID is required');
      }

      await bikeService.deleteBike(id);
      return ApiResponse.success(res, 'Bike deleted successfully');
    } catch (error) {
      if (error.statusCode === 404) {
        return ApiResponse.notFound(res, error.message);
      }
      return ApiResponse.badRequest(res, error.message);
    }
  }

  async getBike(req, res, next) {
    try {
      const { id } = req.params;
      

      if (!id) {
        return ApiResponse.badRequest(res, 'Bike ID is required');
      }

      const bike = await bikeService.getBike(id);
      return ApiResponse.success(res, 'Bike retrieved successfully', bike, 200);
    } catch (error) {
      if (error.statusCode === 404) {
        return ApiResponse.notFound(res, error.message);
      }
      return ApiResponse.badRequest(res, error.message);
    }
  }

  async getAllBikes(req, res, next) {
    try {
      console.log(req.query);
      const bikes = await bikeService.getAllBikes(req.query);
  
      return ApiResponse.success(res, 'Bikes retrieved successfully', bikes, 200);
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  async markBikeAsBooked(req, res, next) {
    try {
      const { id } = req.params;

      if (!id) {
        return ApiResponse.badRequest(res, 'Bike ID is required');
      }

      const bike = await bikeService.updateStatus(id, 'RESERVED');
      return ApiResponse.success(res, 'Bike marked as booked successfully', bike, 200);
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
}

module.exports = new BikeController();
