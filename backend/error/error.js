// error.js (Your custom error handling file)

// Define your custom ErrorHandler class
class ErrorHandler extends Error {
    constructor(message, statusCode) {
        super(message); // Call the parent Error constructor
        this.statusCode = statusCode; // Assign the status code

        // Capture the stack trace for better debugging
        // This makes the stack trace start from where ErrorHandler was called, not from inside its constructor
        Error.captureStackTrace(this, this.constructor);
    }
}

// Your error middleware function
const errorMiddleware = (err, req, res, next) => {
    // Set default error message and status code if not already defined
    err.message = err.message || "Internal Server Error";
    err.statusCode = err.statusCode || 500;

    // In production, for 500-level errors, send a generic message to prevent leaking sensitive information.
    if (process.env.NODE_ENV === 'production' && err.statusCode === 500) {
        err.message = "An unexpected server error has occurred.";
    }
    
    // Send the error response to the client
    return res.status(err.statusCode).json({
        success: false,
        message: err.message,
    });
};

// FIX: Export both errorMiddleware and the ErrorHandler class
// This makes both available when other files 'require' this module.
module.exports = { errorMiddleware, ErrorHandler };
