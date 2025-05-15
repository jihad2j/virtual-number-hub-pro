
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    
    this.statusCode = statusCode;
    // Change 'fail' to 'bad_request' to avoid the invalid status code error
    this.status = `${statusCode}`.startsWith('4') ? 'bad_request' : 'error';
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
