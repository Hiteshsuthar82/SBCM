const successResponse = (res, data = null, message = '', pagination = null) => {
  res.json({
    success: true,
    data,
    message,
    ...(pagination ? { pagination } : {}),
  });
};

const errorResponse = (res, error, status = 400) => {
  res.status(status).json({
    success: false,
    error,
  });
};

module.exports = { successResponse, errorResponse };