const express = require('express');
const router = express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController'); // Import the entire controller object

// Debugging: Log the imported reservationController object
console.log('DEBUG: reservationController in reservationRoute.js:', reservationController);

const protect = require('../middleware/protect'); // Correct import for module.exports = protect;


// Public Test Route
router.get('/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: "Reservation route is working!",
  });
});

// Protected Route to Create a Reservation
router.post('/send', protect, reservationController.sendReservation); // Access sendReservation as a property

// Protected Route to Get My Reservations
router.get('/my', protect, reservationController.getMyReservations); // Access getMyReservations as a property

// ✅ NEW: Protected Route to Update a Specific Reservation by ID
// This assumes your frontend will send the reservation ID in the URL parameter
router.put('/:id', protect, reservationController.updateReservation); // Access updateReservation as a property


module.exports = router;
