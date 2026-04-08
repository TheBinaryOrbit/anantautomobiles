const salesService = require('../services/salesService');
const { ApiResponse } = require('../utils/apiResponse');

class SalesController {
  async createSale(req, res, next) {
    try {
      const sale = await salesService.createSale(req.body);

      return ApiResponse.created(res, 'Sale created successfully with invoice', sale);
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

  async getSale(req, res, next) {
    try {
      const { id } = req.params;

      if (!id) {
        return ApiResponse.badRequest(res, 'Sale ID is required');
      }

      const sale = await salesService.getSale(id);
      return ApiResponse.success(res, 'Sale retrieved successfully', sale, 200);
    } catch (error) {
      if (error.statusCode === 404) {
        return ApiResponse.notFound(res, error.message);
      }
      return ApiResponse.badRequest(res, error.message);
    }
  }

  async getAllSales(req, res, next) {
    try {
      const sales = await salesService.getAllSales();
      return ApiResponse.success(res, 'Sales retrieved successfully', sales, 200);
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  async updateSaleStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!id) {
        return ApiResponse.badRequest(res, 'Sale ID is required');
      }

      if (!status) {
        return ApiResponse.badRequest(res, 'Status is required');
      }

      const sale = await salesService.updateSaleStatus(id, status);
      return ApiResponse.success(res, 'Sale status updated successfully', sale, 200);
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

module.exports = new SalesController();
