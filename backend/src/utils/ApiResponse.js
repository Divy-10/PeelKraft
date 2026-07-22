class ApiResponse {
  constructor(statusCode, message, data = null) {
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
    this.statusCode = statusCode;
  }

  static success(data, message = 'Success') {
    return new ApiResponse(200, message, data);
  }

  static created(data, message = 'Created successfully') {
    return new ApiResponse(201, message, data);
  }

  static paginated(data, pagination, message = 'Success') {
    const response = new ApiResponse(200, message, data);
    response.pagination = pagination;
    return response;
  }
}

export default ApiResponse;
