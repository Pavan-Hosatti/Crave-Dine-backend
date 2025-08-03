const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/orderModel");
const { ErrorHandler } = require("../error/error"); // Assuming you have this for consistent error handling


// 1. Create Razorpay Order
exports.createOrder = async (req, res, next) => { // Added 'next' for consistent error handling
    try {
        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            console.error('Backend: Razorpay API keys are missing from environment variables.');
            return next(new ErrorHandler("Server configuration error: Razorpay API keys missing.", 500));
        }

        console.log('Backend: createOrder received amount:', req.body.amount);

        const { amount } = req.body;

        if (!amount || isNaN(amount) || amount <= 0) {
            console.error('Backend: Invalid amount received for order creation:', amount);
            return next(new ErrorHandler("Invalid amount provided for order.", 400));
        }

        const options = {
            amount: amount * 100, // amount in paise
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
        console.error("Backend: Full error object:", err);
        return next(new ErrorHandler("Failed to create Razorpay order.", 500));
    }
};

// 2. Verify Payment and Place Order
exports.verifyPayment = async (req, res, next) => { // Added 'next'
    const instance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, items, totalAmount, address, userId } = req.body;

    if (!process.env.RAZORPAY_KEY_SECRET) {
        console.error('Backend: RAZORPAY_KEY_SECRET is undefined for signature verification.');
        return next(new ErrorHandler("Server configuration error: Razorpay secret missing.", 500));
    }

    const generatedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest("hex");

    if (generatedSignature !== razorpay_signature) {
        console.warn('Backend: Payment verification failed: Signature mismatch.');
        return next(new ErrorHandler("Payment verification failed: Signature mismatch.", 400));
    }

    try {
        if (!userId || !items || items.length === 0 || !totalAmount || !address) {
            console.error('Backend: Missing data for order creation after payment verification.');
            return next(new ErrorHandler("Missing order details for creation.", 400));
        }

        const order = await Order.create({
            user: userId,
            items,
            totalAmount,
            address,
            razorpay_order_id, // Store Razorpay IDs for reference
            razorpay_payment_id,
            status: 'Paid', // Set status to Paid upon successful verification
        });

        return res.status(200).json({
            success: true,
            message: "Payment verified and order placed successfully",
            order,
        });
    } catch (err) {
        console.error("Backend: Error storing order after payment verification:", err.message);
        console.error("Backend: Full error object during order storage:", err);
        return next(new ErrorHandler("Failed to store order after payment verification.", 500));
    }
};

// ✅ NEW: Handle Razorpay Webhook Notifications
exports.handleRazorpayWebhook = async (req, res, next) => {
    const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!RAZORPAY_WEBHOOK_SECRET) {
        console.error('Backend: RAZORPAY_WEBHOOK_SECRET is not set in environment variables.');
        return res.status(500).json({ success: false, message: "Webhook secret not configured on server." });
    }

    const shasum = crypto.createHmac('sha256', RAZORPAY_WEBHOOK_SECRET);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest('hex');

    if (digest !== req.headers['x-razorpay-signature']) {
        console.warn('Backend: Webhook signature mismatch. Request potentially tampered.');
        return res.status(400).json({ success: false, message: "Invalid webhook signature." });
    }

    console.log('Backend: Webhook signature verified successfully.');
    const event = req.body.event;
    const payload = req.body.payload;

    try {
        switch (event) {
            case 'payment.captured':
                const paymentId = payload.payment.entity.id;
                const orderId = payload.payment.entity.order_id;
                const amount = payload.payment.entity.amount / 100; // Convert paise to rupees
                const status = payload.payment.entity.status;

                console.log(`Backend: Payment Captured Event - Payment ID: ${paymentId}, Order ID: ${orderId}, Amount: ${amount}, Status: ${status}`);

                // Find the order using razorpay_order_id and update its status
                const order = await Order.findOneAndUpdate(
                    { razorpay_order_id: orderId },
                    {
                        status: 'Paid', // Mark as paid
                        razorpay_payment_id: paymentId, // Ensure payment ID is stored
                        // You might also store other payment details if needed
                    },
                    { new: true }
                );

                if (order) {
                    console.log(`Backend: Order ${orderId} updated to Paid.`);
                } else {
                    console.warn(`Backend: Order with Razorpay Order ID ${orderId} not found for update.`);
                }
                break;

            // You can add more cases for other events like 'payment.failed', 'refund.processed' etc.
            // case 'payment.failed':
            //     console.log('Payment Failed Event:', payload.payment.entity);
            //     // Update order status to failed, notify user etc.
            //     break;

            default:
                console.log(`Backend: Unhandled Razorpay event: ${event}`);
                break;
        }

        res.status(200).json({ success: true, message: "Webhook received and processed." });
    } catch (error) {
        console.error("Backend: Error processing webhook:", error);
        next(new ErrorHandler("Error processing webhook.", 500));
    }
};
