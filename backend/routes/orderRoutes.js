const express = require('express');
const { placeOrder, getMyOrders, clearMyOrders } = require('../controllers/orderController'); // Import clearMyOrders
// FIX: Corrected import path and name for isAuthenticated middleware
const { isAuthenticated } = require('../middleware/authMiddleware'); // Assuming auth.js is in backend/middlewares/

const router = express.Router();

// FIX: Updated route to include '/path' as specified by the user
router.post('/path', isAuthenticated, placeOrder);
router.get('/my', isAuthenticated, getMyOrders);
router.delete('/my', isAuthenticated, clearMyOrders); // Route to clear user's orders

module.exports = router;
