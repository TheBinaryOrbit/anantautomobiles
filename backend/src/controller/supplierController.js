const supplierService = require('../services/supplierService');
const { ApiResponse } = require('../utils/apiResponse');

class SupplierController {
  async createSupplier(req, res, next) {
    try {
      const { name, email, phone, companyName, supplierType, addressLine1, addressLine2, city, state, postalCode, country } = req.body;

      const supplierData = { name, email, phone, companyName, supplierType };
      const addressData = { addressLine1, addressLine2, city, state, postalCode, country };

      const supplier = await supplierService.createSupplier(supplierData, addressData);
      return ApiResponse.created(res, 'Supplier created successfully', supplier);
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

  async updateSupplier(req, res, next) {
    try {
      const { id } = req.params;
      const { name, email, phone, companyName, supplierType, addressLine1, addressLine2, city, state, postalCode, country } = req.body;

      if (!id) {
        return ApiResponse.badRequest(res, 'Supplier ID is required');
      }

      const supplierData = { name, email, phone, companyName, supplierType };
      const addressData = { addressLine1, addressLine2, city, state, postalCode, country };

      const supplier = await supplierService.updateSupplier(id, supplierData, addressData);
      return ApiResponse.success(res, 'Supplier updated successfully', supplier, 200);
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

  async deleteSupplier(req, res, next) {
    try {
      const { id } = req.params;

      if (!id) {
        return ApiResponse.badRequest(res, 'Supplier ID is required');
      }

      await supplierService.deleteSupplier(id);
      return ApiResponse.success(res, 'Supplier deleted successfully');
    } catch (error) {
      if (error.statusCode === 404) {
        return ApiResponse.notFound(res, error.message);
      }
      return ApiResponse.badRequest(res, error.message);
    }
  }

  async getSupplier(req, res, next) {
    try {
      const { id } = req.params;

      if (!id) {
        return ApiResponse.badRequest(res, 'Supplier ID is required');
      }

      const supplier = await supplierService.getSupplier(id);
      return ApiResponse.success(res, 'Supplier retrieved successfully', supplier, 200);
    } catch (error) {
      if (error.statusCode === 404) {
        return ApiResponse.notFound(res, error.message);
      }
      return ApiResponse.badRequest(res, error.message);
    }
  }

  async getAllSuppliers(req, res, next) {
    try {
      const suppliers = await supplierService.getAllSuppliers();
      return ApiResponse.success(res, 'Suppliers retrieved successfully', suppliers, 200);
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }
}

module.exports = new SupplierController();
