/**
 * Global error-handling middleware.
 * Must be registered AFTER all routes: app.use(errorHandler)
 */
const errorHandler = (err, req, res, next) => {
  console.error('[ErrorHandler]', err.stack || err.message);

  // Multer errors (file size, wrong type, etc.)
  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`,
    });
  }

  // Custom file-type rejection from fileFilter
  if (err.message && err.message.startsWith('File type not allowed')) {
    return res.status(400).json({ success: false, message: err.message });
  }

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: messages.join(', ') });
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    return res.status(400).json({ success: false, message: 'Invalid report ID' });
  }

  // Default 500
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal server error',
  });
};

module.exports = errorHandler;
