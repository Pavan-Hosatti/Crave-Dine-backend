const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/orderModel"); 



// Removed global 'instance' declaration.
// It will now be initialized inside createOrder and verifyPayment for robustness.

// 1. Create Razorpay Order
exports.createOrder = async (req, res) => {
  try {
    // Re-initialize Razorpay instance inside the function to ensure fresh context
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // Basic check for keys before proceeding
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        console.error('Backend: Razorpay API keys are missing from environment variables.');
        return res.status(500).json({ success: false, message: "Server configuration error: Razorpay API keys missing." });
    }

    // Log the incoming amount for debugging
    console.log('Backend: createOrder received amount:', req.body.amount);

    const { amount } = req.body;

    // Basic validation
    if (!amount || isNaN(amount) || amount <= 0) {
      console.error('Backend: Invalid amount received for order creation:', amount);
      return res.status(400).json({ success: false, message: "Invalid amount provided for order." });
    }

    const options = {
      amount: amount * 100, // amount in paise (frontend sends totalAmount, backend converts)
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

 

    const order = await instance.orders.create(options);

  

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (err) {
    console.error("Backend: Error creating Razorpay order:", err.message);
    // Log the full error object for more details in development
    console.error("Backend: Full error object:", err);
    return res.status(500).json({ success: false, message: "Failed to create Razorpay order.", error: err.message });
  }
};

// 2. Verify Payment and Place Order
exports.verifyPayment = async (req, res) => {
  // Re-initialize Razorpay instance inside the function for robustness
  const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, items, totalAmount, address, userId } = req.body;




  // Ensure RAZORPAY_KEY_SECRET is available for signature verification
  if (!process.env.RAZORPAY_KEY_SECRET) {
    console.error('Backend: RAZORPAY_KEY_SECRET is undefined for signature verification.');
    return res.status(500).json({ success: false, message: "Server configuration error: Razorpay secret missing." });
  }

  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");




  if (generatedSignature !== razorpay_signature) {
    console.warn('Backend: Payment verification failed: Signature mismatch.');
    return res.status(400).json({ success: false, message: "Payment verification failed: Signature mismatch." });
  }

  // If verification passes, store the order
  try {
    // Basic validation for order data
    if (!userId || !items || items.length === 0 || !totalAmount || !address) {
      console.error('Backend: Missing data for order creation after payment verification.');
      return res.status(400).json({ success: false, message: "Missing order details for creation." });
    }

    const order = await Order.create({
      user: userId,
      items,
      totalAmount,
      address,
      razorpay_order_id, // Store Razorpay IDs for reference
      razorpay_payment_id,
    });

    

    return res.status(200).json({
      success: true,
      message: "Payment verified and order placed successfully",
      order,
    });
  } catch (err) {
    console.error("Backend: Error storing order after payment verification:", err.message);
    console.error("Backend: Full error object during order storage:", err);
    return res.status(500).json({ success: false, message: "Failed to store order after payment verification.", error: err.message });
  }
};
