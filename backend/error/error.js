const errorMiddleware = (err, req, res, next) => {
    err.message = err.message || "Internal Server Error";
    err.statusCode = err.statusCode || 500;

    // Check if the environment is 'production' and the error is a 500-level error.
    // We send a generic message to prevent leaking sensitive information.
    if (process.env.NODE_ENV === 'production' && err.statusCode === 500) {
        err.message = "An unexpected server error has occurred.";
    }
    
    return res.status(err.statusCode).json({
        success: false,
        message: err.message,
    });
};

module.exports = { errorMiddleware };