const discountService = require('../services/discountService');
const { ApiResponse } = require('../utils/apiResponse');

class DiscountController {
  async createDiscount(req, res, next) {
    try {
      const discount = await discountService.createDiscount(req.body);
      return ApiResponse.created(res, 'Discount created successfully', discount);
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  async getAllDiscounts(req, res, next) {
    try {
      const discounts = await discountService.getAllDiscounts();
      return ApiResponse.success(res, 'Discounts retrieved successfully', discounts);
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  async getActiveDiscounts(req, res, next) {
    try {
      const discounts = await discountService.getActiveDiscounts();
      return ApiResponse.success(res, 'Active discounts retrieved successfully', discounts);
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  async getDiscount(req, res, next) {
    try {
      const { id } = req.params;
      const discount = await discountService.getDiscount(id);
      return ApiResponse.success(res, 'Discount retrieved successfully', discount);
    } catch (error) {
      if (error.statusCode === 404) {
        return ApiResponse.notFound(res, error.message);
      }
      return ApiResponse.badRequest(res, error.message);
    }
  }

  async updateDiscount(req, res, next) {
    try {
      const { id } = req.params;
      const discount = await discountService.updateDiscount(id, req.body);
      return ApiResponse.success(res, 'Discount updated successfully', discount);
    } catch (error) {
      if (error.statusCode === 404) {
        return ApiResponse.notFound(res, error.message);
      }
      return ApiResponse.badRequest(res, error.message);
    }
  }

  async deleteDiscount(req, res, next) {
    try {
      const { id } = req.params;
      await discountService.deleteDiscount(id);
      return ApiResponse.success(res, 'Discount deleted successfully');
    } catch (error) {
      if (error.statusCode === 404) {
        return ApiResponse.notFound(res, error.message);
      }
      return ApiResponse.badRequest(res, error.message);
    }
  }
}

module.exports = new DiscountController();
