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

  async updateServiceInquiryStatus(req, res) {
    try {
      const { id } = req.params;
      const { remarks } = req.body;
      console.log(`Updating sales inquiry ${id} status to resolved with remarks:`, remarks);
      if(!remarks) {
        return ApiResponse.badRequest(res, 'Remarks are required to resolve the inquiry');
      }

      const inquiry = await inquiryService.updateServiceInquiryStatus(id, true, remarks );
      return ApiResponse.success(res, 'Service inquiry status updated successfully', { id: inquiry.id, isResolved: inquiry.isResolved });
    }
    catch (error) {
      if (error.statusCode === 404) {
        return ApiResponse.notFound(res, error.message);
      }
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

  async updateSalesInquiryStatus(req, res) {
    try {
      const { id } = req.params;
      const { remarks } = req.body;
      console.log(`Updating sales inquiry ${id} status to resolved with remarks:`, remarks);
      if(!remarks) {
        return ApiResponse.badRequest(res, 'Remarks are required to resolve the inquiry');
      }
      const inquiry = await inquiryService.updateSalesInquiryStatus(id, true /* isResolved */, remarks /* remarks */);
      return ApiResponse.success(res, 'Sales inquiry status updated successfully', { id: inquiry.id, isResolved: inquiry.isResolved });
    }
    catch (error) {
      if (error.statusCode === 404) {
        return ApiResponse.notFound(res, error.message);
      }
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