const purchaseService = require('../services/purchaseService');
const { ApiResponse } = require('../utils/apiResponse');

class PurchaseController {
  async createPurchase(req, res, next) {
    try {
      const purchase = await purchaseService.createPurchase(req.body);
      return ApiResponse.created(res, 'Purchase recorded successfully', purchase);
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

  async getAllPurchases(req, res, next) {
    try {
      const purchases = await purchaseService.getAllPurchases();
      return ApiResponse.success(res, 'Purchases retrieved successfully', purchases, 200);
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  async getPurchase(req, res, next) {
    try {
      const { id } = req.params;
      const purchase = await purchaseService.getPurchase(id);
      return ApiResponse.success(res, 'Purchase details retrieved successfully', purchase, 200);
    } catch (error) {
      if (error.statusCode === 404) {
        return ApiResponse.notFound(res, error.message);
      }
      return ApiResponse.badRequest(res, error.message);
    }
  }

  async deletePurchase(req, res, next) {
    try {
      const { id } = req.params;
      await purchaseService.deletePurchase(id);
      return ApiResponse.success(res, 'Purchase deleted successfully');
    } catch (error) {
      if (error.statusCode === 404) {
        return ApiResponse.notFound(res, error.message);
      }
      return ApiResponse.badRequest(res, error.message);
    }
  }
}

module.exports = new PurchaseController();
