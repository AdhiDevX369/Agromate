/**
 * Utility functions for the server-side of AgroMate FDMS
 */

/**
 * Create a standardized API response
 * @param {boolean} success - Whether the operation was successful
 * @param {string} message - Response message
 * @param {object|array} data - Response data payload (optional)
 * @returns {object} Standardized response object
 */
exports.createResponse = (success, message, data = null) => {
  const response = {
    success,
    message
  };

  if (data !== null) {
    response.data = data;
  }

  return response;
};

/**
 * Create an error response with proper status code
 * @param {Error} error - The error object
 * @param {string} defaultMessage - Default error message
 * @returns {object} Error response object with status code
 */
exports.createErrorResponse = (error, defaultMessage = 'Server Error') => {
  console.error(error);
  
  // Default to 500 (Server Error) status code
  let statusCode = 500;
  let message = defaultMessage;

  // Check for specific error types to set appropriate status codes
  if (error.name === 'ValidationError') {
    statusCode = 400; // Bad Request
    message = Object.values(error.errors).map(err => err.message).join(', ');
  } else if (error.name === 'CastError') {
    statusCode = 400; // Bad Request
    message = 'Invalid resource ID';
  } else if (error.code === 11000) {
    statusCode = 409; // Conflict
    message = 'Duplicate resource found';
  } else if (error.message) {
    message = error.message;
  }

  return {
    statusCode,
    response: this.createResponse(false, message)
  };
};

/**
 * Validate required fields in a request body
 * @param {object} body - Request body
 * @param {array} fields - Array of required field names
 * @returns {string|null} Error message or null if valid
 */
exports.validateRequiredFields = (body, fields) => {
  const missingFields = fields.filter(field => !body[field]);
  
  if (missingFields.length > 0) {
    return `Missing required fields: ${missingFields.join(', ')}`;
  }
  
  return null;
};

/**
 * Format date for consistent display
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
exports.formatDate = (date) => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toISOString().split('T')[0];
  } catch (error) {
    return '';
  }
};