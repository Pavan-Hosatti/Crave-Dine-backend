const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');


const { isAuthenticated } = require('../middleware/authMiddleware');


router.post('/send', isAuthenticated, reservationController.sendReservation);
router.get('/my', isAuthenticated, reservationController.getMyReservations);




// ✅ Public Test Route
router.get('/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: "Reservation route is working!",
  });
});

// 🔐 Protected Route to Create a Reservation


router.post('/send', isAuthenticated, reservationController.sendReservation);
router.get('/my', isAuthenticated, reservationController.getMyReservations);



module.exports = router;
