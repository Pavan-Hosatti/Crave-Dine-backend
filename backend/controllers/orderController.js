const Order = require('../models/orderModel');
const { ErrorHandler } = require('../error/error'); // Assuming you have this for consistent error handling

exports.placeOrder = async (req, res, next) => { // Added 'next' for consistent error handling with ErrorHandler
  const userId = req.user._id; // User ID from authenticated middleware
  const { items, totalAmount, address } = req.body;

  if (!items || !totalAmount || !address) {
    return next(new ErrorHandler('Missing order details (items, totalAmount, or address)', 400));
  }
  // Added validation for items array to ensure it's not empty
  if (!Array.isArray(items) || items.length === 0) {
    return next(new ErrorHandler('Order must contain at least one item.', 400));
  }

  try {
    const order = await Order.create({
      user: userId,
      items,
      totalAmount,
      address,
      status: 'Placed', // Default status
    });

    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (err) {
    console.error("ERROR: Failed to place order in order.Controller.js:", err);
    // Enhanced error handling for Mongoose validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return next(new ErrorHandler(`Validation Error: ${messages.join(', ')}`, 400));
    }
    return next(new ErrorHandler('Failed to place order due to server error.', 500));
  }
};

exports.getMyOrders = async (req, res, next) => { // Added 'next'
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    console.error("ERROR: Failed to fetch orders in order.Controller.js:", err);
    return next(new ErrorHandler('Failed to fetch orders due to server error.', 500));
  }
};

// NEW FEATURE: Function to clear all orders for the authenticated user
exports.clearMyOrders = async (req, res, next) => {
  try {
    const userId = req.user._id; // Get user ID from authenticated middleware

    // Delete all orders associated with this user
    const result = await Order.deleteMany({ user: userId });

    if (result.deletedCount === 0) {
      return res.status(200).json({ message: 'No orders found to clear for this user.' });
    }

    res.status(200).json({ message: `Successfully cleared ${result.deletedCount} orders.` });
  } catch (err) {
    console.error("ERROR: Failed to clear orders in order.Controller.js:", err);
    return next(new ErrorHandler('Failed to clear orders due to server error.', 500));
  }
};
