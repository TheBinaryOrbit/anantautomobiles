class ApiResponse {
  constructor(statusCode, message, data = null) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }

  static success(res, message = 'Success', data = null, statusCode = 200) {
    return res.status(statusCode).json(new ApiResponse(statusCode, message, data));
  }

  static error(res, message = 'Error', statusCode = 500, data = null) {
    return res.status(statusCode).json(new ApiResponse(statusCode, message, data));
  }

  static created(res, message = 'Created successfully', data = null) {
    return res.status(201).json(new ApiResponse(201, message, data));
  }

  static noContent(res, message = 'No content') {
    return res.status(204).json(new ApiResponse(204, message));
  }

  static badRequest(res, message = 'Bad request', data = null) {
    return res.status(400).json(new ApiResponse(400, message, data));
  }

  static unauthorized(res, message = 'Unauthorized') {
    return res.status(401).json(new ApiResponse(401, message));
  }

  static forbidden(res, message = 'Forbidden') {
    return res.status(403).json(new ApiResponse(403, message));
  }

  static notFound(res, message = 'Not found') {
    return res.status(404).json(new ApiResponse(404, message));
  }
}

module.exports = { ApiResponse };
