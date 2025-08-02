const express = require('express');
const { placeOrder, getMyOrders, clearMyOrders } = require('../controllers/orderController');
const { isAuthenticated } = require('../middleware/authMiddleware');

const router = express.Router();

// The 'placeOrder' function is typically called internally by the payment verification route

// not usually exposed as a direct frontend route like '/path'.
// So, removing the '/path' route here.

router.get('/my', isAuthenticated, getMyOrders); // Route to get authenticated user's orders
router.delete('/my', isAuthenticated, clearMyOrders); // Route to clear user's orders

module.exports = router;
