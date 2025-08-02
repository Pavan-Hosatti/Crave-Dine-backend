const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minlength: [3, "First name must contain at least 3 characters!"],
        maxlength: [30, "First name cannot exceed 30 characters!"],
    },
    lastName: {
        type: String,
        required: true,
        minlength: [3, "Last name must contain at least 3 characters!"],
        maxlength: [30, "Last name cannot exceed 30 characters!"],
    },
    email: {
        type: String,
        required: true,
        unique: false,
        validate: {
            validator: function (v) {
                return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(v);
            },
            message: props => `${props.value} is not a valid email address!`
        },
    },
    phone: {
        type: String,
        required: true,
        minlength: [10, "Phone number must contain exactly 10 digits!"],
        maxlength: [10, "Phone number must contain exactly 10 digits!"],
    },
    date: {
        type: String,
        required: true,
    },
    time: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
        minlength: [10, "Address must contain at least 10 characters!"],
    },
    tableNumber: {
        type: Number,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Reservation = mongoose.model('Reservation', reservationSchema);

module.exports = Reservation;