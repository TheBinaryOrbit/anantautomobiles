const exchangeBikeService = require('../services/exchangeBikeService');
const { ApiResponse } = require('../utils/apiResponse');

class ExchangeBikeController {
  async createExchangeBike(req, res, next) {
    try {
      const exchangeBike = await exchangeBikeService.createExchangeBike(req.body);
      return ApiResponse.created(res, 'Exchange bike recorded successfully', exchangeBike);
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  async getAllExchangeBikes(req, res, next) {
    try {
      const exchangeBikes = await exchangeBikeService.getAllExchangeBikes();
      return ApiResponse.success(res, 'Exchange bike records retrieved successfully', exchangeBikes);
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  async getExchangeBike(req, res, next) {
    try {
      const { id } = req.params;
      const exchangeBike = await exchangeBikeService.getExchangeBike(id);
      return ApiResponse.success(res, 'Exchange bike record retrieved successfully', exchangeBike);
    } catch (error) {
      if (error.statusCode === 404) {
        return ApiResponse.notFound(res, error.message);
      }
      return ApiResponse.badRequest(res, error.message);
    }
  }

  async updateExchangeBike(req, res, next) {
    try {
      const { id } = req.params;
      const exchangeBike = await exchangeBikeService.updateExchangeBike(id, req.body);
      return ApiResponse.success(res, 'Exchange bike record updated successfully', exchangeBike);
    } catch (error) {
      if (error.statusCode === 404) {
        return ApiResponse.notFound(res, error.message);
      }
      return ApiResponse.badRequest(res, error.message);
    }
  }

  async deleteExchangeBike(req, res, next) {
    try {
      const { id } = req.params;
      await exchangeBikeService.deleteExchangeBike(id);
      return ApiResponse.success(res, 'Exchange bike record deleted successfully');
    } catch (error) {
      if (error.statusCode === 404) {
        return ApiResponse.notFound(res, error.message);
      }
      return ApiResponse.badRequest(res, error.message);
    }
  }
}

module.exports = new ExchangeBikeController();