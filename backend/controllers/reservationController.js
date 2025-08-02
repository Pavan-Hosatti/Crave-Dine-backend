const Reservation = require('../models/reservationSchema');
const { ErrorHandler } = require('../error/error');
const mongoose = require('mongoose');

// ✅ Test route
exports.test = (req, res) => {
  res.status(200).json({
    success: true,
    message: "Test route is working"
  });
};

// ✅ Send reservation
exports.sendReservation = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, date, time, address } = req.body;

 

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !date || !time || !address) {
      return next(new ErrorHandler("Please fill all fields", 400));
    }

    // Generate a random table number (e.g., between 1 and 100)
    const tableNumber = Math.floor(Math.random() * 100) + 1;
   

    const reservationData = {
      firstName,
      lastName,
      email,
      phone,
      date,
      time,
      address,
      tableNumber, // Add tableNumber to reservation data
    };

    // CRITICAL FIX: Ensure req.user is populated by isAuthenticated middleware
    // And assign req.user.id to the reservationData.user field
    if (req.user && req.user._id) { // Use _id from req.user as populated by Mongoose
      reservationData.user = req.user._id;
     
    } else if (req.user && req.user.id) { // Fallback for req.user.id if _id isn't directly available
      reservationData.user = req.user.id;
    } else {
  
      // Depending on your schema, you might want to throw an error here if a user is mandatory
      // return next(new ErrorHandler("User not authenticated for reservation", 401));
    }

    // Create reservation
    const reservation = await Reservation.create(reservationData);

  

    res.status(201).json({
      success: true,
      message: "Reservation sent successfully",
      reservation // Ensure the full reservation object (including tableNumber and user ID) is returned
    });
  } catch (error) {
    console.error("Backend: Error in sendReservation:", error);
    // Handle Mongoose validation errors specifically
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return next(new ErrorHandler(messages.join(', '), 400));
    }
    return next(new ErrorHandler(error.message, 500));
  }
};

// ✅ Fetch reservations of the logged-in user
exports.getMyReservations = async (req, res, next) => {
  try {
    // CRITICAL FIX: Ensure req.user and req.user._id are available from isAuthenticated middleware
    if (!req.user || (!req.user._id && !req.user.id)) { // Check for either _id or id

      return next(new ErrorHandler("Unauthorized! Please log in.", 401));
    }

    const userIdToQuery = req.user._id || req.user.id; // Use _id if available, otherwise id

    // Query reservations associated with the logged-in user's ID
    const reservations = await Reservation.find({ user: userIdToQuery }).sort({ createdAt: -1 });



    return res.status(200).json({
      success: true,
      reservations,
    });
  } catch (error) {
    console.error("Backend: Error fetching reservations:", error.message);
    return next(new ErrorHandler("Unable to fetch reservations", 500));
  }
};

// ✅ Check existing reservations (optional debug utility)
exports.checkExistingReservations = async (req, res, next) => {
  try {
    const collections = await mongoose.connection.db.listCollections({ name: 'reservations' }).toArray(); // Assuming collection name is 'reservations'

    if (collections.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Reservations collection does not exist yet",
        collections: await mongoose.connection.db.listCollections().toArray()
      });
    }

    const count = await mongoose.connection.db.collection('reservations').countDocuments();
    const documents = await mongoose.connection.db.collection('reservations').find({}).limit(5).toArray();

    return res.status(200).json({
      success: true,
      message: `Found ${count} documents in reservations collection`,
      sampleDocuments: documents
    });
  } catch (error) {
    console.error("Backend: Error checking reservations:", error);
    return next(new ErrorHandler(error.message, 500));
  }
};

// ✅ Get all reservations (admin feature)
exports.getAllReservations = async (req, res, next) => {
  try {
    const reservations = await Reservation.find();

    return res.status(200).json({
      success: true,
      count: reservations.length,
      reservations
    });
  } catch (error) {
    console.error("Backend: Error getting all reservations:", error);
    return next(new ErrorHandler(error.message, 500));
  }
};

// ✅ List all MongoDB collections (debugging utility)
exports.listCollections = async (req, res, next) => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();

    return res.status(200).json({
      success: true,
      databaseName: mongoose.connection.db.databaseName,
      collections: collections.map(c => c.name)
    });
  } catch (error) {
    console.error("Backend: Error listing collections:", error);
    return next(new ErrorHandler(error.message, 500));
  }
};
