// models/userSchema.js
const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  houseName: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, default: 'India' }, // Default country
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/.+@.+\..+/, 'Please fill a valid email address'],
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  // NEW: Add address field as a nested object
  address: {
    type: addressSchema,
    required: false, // Address is optional initially
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', userSchema);
