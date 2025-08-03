const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

// Debugging: Log the imported paymentController object
console.log('DEBUG: paymentController in paymentRoute.js:', paymentController);

router.post("/order", paymentController.createOrder);
router.post("/verify", paymentController.verifyPayment);

// ✅ FIX: Corrected the function name from handleWebhook to handleRazorpayWebhook
router.post("/webhook", paymentController.handleRazorpayWebhook);

module.exports = router;
