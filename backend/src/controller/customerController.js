const customerService = require('../services/customerService');
const { ApiResponse } = require('../utils/apiResponse');

class CustomerController {
  async createCustomer(req, res, next) {
    try {
      const { name, email, phone, aadhaarNumber, panNumber, addressLine1, addressLine2, city, state, postalCode, country } = req.body;

      const customerData = { name, email, phone, aadhaarNumber, panNumber };
      const addressData = { addressLine1, addressLine2, city, state, postalCode, country };

      const customer = await customerService.createCustomer(customerData, addressData);
      return ApiResponse.created(res, 'Customer created successfully', customer);
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

  async updateCustomer(req, res, next) {
    try {
      const { id } = req.params;
      const { name, email, phone, aadhaarNumber, panNumber, addressLine1, addressLine2, city, state, postalCode, country } = req.body;

      if (!id) {
        return ApiResponse.badRequest(res, 'Customer ID is required');
      }

      const customerData = { name, email, phone, aadhaarNumber, panNumber };
      const addressData = { addressLine1, addressLine2, city, state, postalCode, country };

      const customer = await customerService.updateCustomer(id, customerData, addressData);
      return ApiResponse.success(res, 'Customer updated successfully', customer, 200);
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

  async deleteCustomer(req, res, next) {
    try {
      const { id } = req.params;

      if (!id) {
        return ApiResponse.badRequest(res, 'Customer ID is required');
      }

      await customerService.deleteCustomer(id);
      return ApiResponse.success(res, 'Customer deleted successfully');
    } catch (error) {
      if (error.statusCode === 404) {
        return ApiResponse.notFound(res, error.message);
      }
      return ApiResponse.badRequest(res, error.message);
    }
  }

  async getCustomer(req, res, next) {
    try {
      const { id } = req.params;

      if (!id) {
        return ApiResponse.badRequest(res, 'Customer ID is required');
      }

      const customer = await customerService.getCustomer(id);
      return ApiResponse.success(res, 'Customer retrieved successfully', customer, 200);
    } catch (error) {
      if (error.statusCode === 404) {
        return ApiResponse.notFound(res, error.message);
      }
      return ApiResponse.badRequest(res, error.message);
    }
  }

  async getAllCustomers(req, res, next) {
    try {
      const customers = await customerService.getAllCustomers();
      return ApiResponse.success(res, 'Customers retrieved successfully', customers, 200);
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  async searchCustomers(req, res, next) {
    try {
      const { q } = req.query;

      if (!q || q.trim() === '') {
        return ApiResponse.badRequest(res, 'Search query is required');
      }

      const customers = await customerService.searchCustomers(q.trim());
      return ApiResponse.success(res, 'Customers searched successfully', customers, 200);
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }
}

module.exports = new CustomerController();
