const mongoose = require('mongoose');
const validator = require('validator');

const reservationSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    minLength: [3, "First name must contain at least 3 characters!"],
    maxLength: [30, "First name cannot exceed 30 characters!"],
  },
  lastName: {
    type: String,
    required: true,
    minLength: [3, "Last name must contain at least 3 characters!"],
    maxLength: [30, "Last name cannot exceed 30 characters!"],
  },
  email: {
    type: String,
    required: true,
    validate: [validator.isEmail, "Please enter a valid email address!"],
  },
  phone: {
    type: Number,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
});

const Reservation = mongoose.model('Reservation', reservationSchema);

module.exports = Reservation;
