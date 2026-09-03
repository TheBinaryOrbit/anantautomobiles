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

  async updateSale(req, res, next) {
    try {
      const { id } = req.params;

      if (!id) {
        return ApiResponse.badRequest(res, 'Sale ID is required');
      }

      const sale = await salesService.updateSale(id, req.body);
      return ApiResponse.success(res, 'Sale updated successfully', sale, 200);
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

  async updatePendingAmount(req, res, next) {
    try {
      const { id } = req.params;
      const { pendingAmount } = req.body;

      if (!id) {
        return ApiResponse.badRequest(res, 'Sale ID is required');
      }

      if (pendingAmount === undefined || typeof pendingAmount !== 'number' || pendingAmount < 0) {
        return ApiResponse.badRequest(res, 'Pending Amount must be a non-negative number');
      }

      const sale = await salesService.updatePendingAmount(id, pendingAmount);
      return ApiResponse.success(res, 'Pending amount updated successfully', sale, 200);
    } catch (error) {
      if (error.statusCode === 404) {
        return ApiResponse.notFound(res, error.message);
      }
      return ApiResponse.badRequest(res, error.message);
    }
  }

  async assignBike(req, res, next) {
    try {
      const { id } = req.params; // saleItemId
      const { bikeId } = req.body;

      if (!id || !bikeId) {
        return ApiResponse.badRequest(res, 'Sale Item ID and Bike ID are required');
      }

      const updatedItem = await salesService.assignBikeToSaleItem(id, bikeId);
      return ApiResponse.success(res, 'Bike assigned successfully', updatedItem, 200);
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({
          success: false,
          statusCode: error.statusCode,
          message: error.message
        });
      }
      return ApiResponse.badRequest(res, error.message);
    }
  }

  async deleteSale(req, res, next) {
    try {
      const { id } = req.params;

      if (!id) {
        return ApiResponse.badRequest(res, 'Sale ID is required');
      }

      const sale = await salesService.deleteSale(id);
      return ApiResponse.success(res, 'Sale deleted successfully', sale, 200);
    } catch (error) {
      if (error.statusCode === 404) {
        return ApiResponse.notFound(res, error.message);
      }
      return ApiResponse.badRequest(res, error.message);
    }
  }

  async generatePDISlip(req, res, next) {
    try {
      const { id } = req.params;
      const pdiInfo = await salesService.generatePDISlip(id);
      return ApiResponse.success(res, 'PDI Slip generated successfully', pdiInfo, 200);
    } catch (error) {
      if (error.statusCode === 404) {
        return ApiResponse.notFound(res, error.message);
      }
      return ApiResponse.badRequest(res, error.message);
    }
  }

  async exchangeItem(req, res, next) {
    try {
      const { id } = req.params; // saleItemId
      const { newItemType, newItemId } = req.body;

      if (!id || !newItemType || !newItemId) {
        return ApiResponse.badRequest(res, 'Sale Item ID, New Item Type, and New Item ID are all required parameters.');
      }

      const updatedSale = await salesService.exchangeSaleItem(id, req.body);
      return ApiResponse.success(res, 'Item exchange successfully processed and invoice refreshed.', updatedSale, 200);
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({
          success: false,
          statusCode: error.statusCode,
          message: error.message
        });
      }
      return ApiResponse.badRequest(res, error.message || 'Error occurred while processing item exchange');
    }
  }
}

module.exports = new SalesController();
