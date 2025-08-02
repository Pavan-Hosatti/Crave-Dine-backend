const mongoose = require('mongoose');

// Define the schema for individual items within an order
const orderItemSchema = new mongoose.Schema({
    dishName: {
        type: String,
        required: true, // This was the field causing the validation error, now explicitly required
        trim: true // Trim whitespace from the beginning and end of the string
    },
    quantity: {
        type: Number,
        required: true,
        min: 1 // Ensure quantity is at least 1
    },
    price: {
        type: Number,
        required: true,
        min: 0 // Price should not be negative
    }
}, { _id: false }); // Do not create a separate _id for subdocuments (optional, but common for array items)

// Define the schema for the address
const addressSchema = new mongoose.Schema({
    houseName: {
        type: String,
        required: true,
        trim: true
    },
    street: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    state: {
        type: String,
        required: true,
        trim: true
    },
    zipCode: {
        type: String,
        required: true,
        trim: true
    },
    country: {
        type: String,
        required: true,
        trim: true
    }
}, { _id: false }); // Do not create a separate _id for subdocuments

// Define the main Order schema
const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true // An order must be associated with a user
    },
    items: {
        type: [orderItemSchema], // Array of orderItemSchema
        required: true,
        validate: {
            validator: function(v) {
                return v && v.length > 0; // Ensure the items array is not empty
            },
            message: 'Order must contain at least one item.'
        }
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0 // Total amount should not be negative
    },
    address: {
        type: addressSchema, // Embedded address document
        required: true // An order must have a delivery address
    },
    status: {
        type: String,
        enum: ['Placed', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'],
        default: 'Placed'
    },
}, {
    timestamps: true // Adds createdAt and updatedAt timestamps automatically
});

// Export the Order model
module.exports = mongoose.model('Order', orderSchema);
