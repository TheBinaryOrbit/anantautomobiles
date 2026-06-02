const inquiryService = require('../services/inquiryService');
const { ApiResponse } = require('../utils/apiResponse');

class InquiryController {
  // ─── Service Inquiries ───
  async createServiceInquiry(req, res) {
    try {
      const inquiry = await inquiryService.createServiceInquiry(req.body);
      return ApiResponse.created(res, 'Service inquiry submitted successfully', inquiry);
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  async getAllServiceInquiries(req, res) {
    try {
      const inquiries = await inquiryService.getAllServiceInquiries();
      return ApiResponse.success(res, 'Service inquiries retrieved successfully', inquiries);
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  // ─── Sales Inquiries ───
  async createSalesInquiry(req, res) {
    try {
      const inquiry = await inquiryService.createSalesInquiry(req.body);
      return ApiResponse.created(res, 'Sales inquiry submitted successfully', inquiry);
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  async getAllSalesInquiries(req, res) {
    try {
      const inquiries = await inquiryService.getAllSalesInquiries();
      return ApiResponse.success(res, 'Sales inquiries retrieved successfully', inquiries);
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }
}

module.exports = new InquiryController();