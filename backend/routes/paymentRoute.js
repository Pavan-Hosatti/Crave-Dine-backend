const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

router.post("/order", paymentController.createOrder);
router.post("/verify", paymentController.verifyPayment);

// ✅ NEW: Route to handle Razorpay Webhooks
// Razorpay will send POST requests to this endpoint
router.post("/webhook", paymentController.handleWebhook);

module.exports = router;
