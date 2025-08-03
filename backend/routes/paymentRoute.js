const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController"); // Import the entire controller object

// You can add a console.log here to debug what 'paymentController' contains
// console.log('DEBUG: paymentController object:', paymentController);

router.post("/order", paymentController.createOrder); // Access createOrder as a property
router.post("/verify", paymentController.verifyPayment); // Access verifyPayment as a property

module.exports = router;
