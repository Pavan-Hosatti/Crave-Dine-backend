const express = require('express');
const { signup, login, googleSignIn, updateAddress, changePassword, updateEmail, updateUsername, getUserProfile, deleteAccount } = require('../controllers/auth.Controller');
const { isAuthenticated } = require('../middleware/authMiddleware'); // Assuming you have an isAuthenticated middleware

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/google', googleSignIn); // Endpoint for Google Sign-In

// Protected routes (require authentication)
router.put('/address', isAuthenticated, updateAddress);
router.put('/change-password', isAuthenticated, changePassword);
router.put('/update-email', isAuthenticated, updateEmail);
router.put('/update-username', isAuthenticated, updateUsername); // FIX: New route for updating username
router.delete('/delete-account', isAuthenticated, deleteAccount);

router.get('/me', isAuthenticated, getUserProfile); // Route to get authenticated user's profile

module.exports = router;
