// This file (e.g., controllers/authController.js)
// relies on environment variables being loaded by your main server file (e.g., server.js or app.js).
// Therefore, 'require('dotenv').config();' should NOT be present here.

const User = require('../models/userSchema');

// FIX: Changed import back to destructuring for ErrorHandler, assuming it's a named export from ../error/error.js
const { ErrorHandler } = require('../error/error'); 
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const firebaseAdmin = require('firebase-admin'); // Ensure firebase-admin is installed: npm install firebase-admin
const crypto = require('crypto'); // For generating random password for Google Sign-In


// Directly use the provided Firebase service account JSON object
const serviceAccount = {
    type: process.env.FIREBASE_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
};


// Initialize Firebase Admin SDK if not already done
if (!firebaseAdmin.apps.length) {
    firebaseAdmin.initializeApp({
        credential: firebaseAdmin.credential.cert(serviceAccount)
    });
}


// Utility to generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '100d', // Token expires in 100 hour
    });
};

// ✅ Signup User
exports.signup = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return next(new ErrorHandler("Please enter all fields", 400));
        }

        let user = await User.findOne({ email });
        if (user) {
            return next(new ErrorHandler("User already exists", 400));
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        user = await User.create({
            username,
            email,
            password: hashedPassword,
        });

        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                address: user.address, // Include address if it exists
            },
            token,
        });
    } catch (error) {
        console.error("Error in signup:", error);
        // Handle Mongoose validation errors specifically
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return next(new ErrorHandler(`Validation Error: ${messages.join(', ')}`, 400));
        }
        return next(new ErrorHandler(error.message, 500));
    }
};

// ✅ Login User
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(new ErrorHandler("Please enter all fields", 400));
        }

        const user = await User.findOne({ email }).select('+password'); // Select password for comparison
        if (!user) {
            return next(new ErrorHandler("Invalid credentials", 401));
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return next(new ErrorHandler("Invalid credentials", 401));
        }

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: "Logged in successfully",
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                address: user.address,
            },
            token,
        });
    } catch (error) {
        console.error("Error in login:", error);
        // Handle Mongoose validation errors specifically
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return next(new ErrorHandler(`Validation Error: ${messages.join(', ')}`, 400));
        }
        return next(new ErrorHandler(error.message, 500));
    }
};

// ✅ Google Sign-In with Firebase ID Token Verification
exports.googleSignIn = async (req, res, next) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return next(new ErrorHandler("ID token is required", 400));
        }

        const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
        const { email, name, picture } = decodedToken;

        let user = await User.findOne({ email });

        if (!user) {
            // If user doesn't exist, create a new one
            user = await User.create({
                username: name || email.split('@')[0], // Use name from Google or derive from email
                email,
                // For Google sign-in, we don't store a password directly
                // You might want to generate a random one or handle it differently
                password: await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10), // Generate a random password
                avatar: picture, // Store Google profile picture if desired
            });
        }

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: "Google sign-in successful",
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                address: user.address,
                avatar: user.avatar,
            },
            token,
        });
    } catch (error) {
        console.error("Error in Google sign-in:", error);
        // Handle Mongoose validation errors specifically
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return next(new ErrorHandler(`Validation Error: ${messages.join(', ')}`, 400));
        }
        return next(new ErrorHandler(error.message, 500));
    }
};

// ✅ Update User Address
exports.updateAddress = async (req, res, next) => {
    try {
        const { address } = req.body;
        const userId = req.user.id; // User ID from authenticated middleware

        if (!address) {
            return next(new ErrorHandler("Address data is required", 400));
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { address: address },
            { new: true, runValidators: true } // Return updated document and run schema validators
        );

        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }

        res.status(200).json({
            success: true,
            message: "Address updated successfully",
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                address: user.address,
            },
        });
    } catch (error) {
        console.error("Error updating address:", error); // Log the full error object
        // Handle Mongoose validation errors specifically
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return next(new ErrorHandler(`Validation Error: ${messages.join(', ')}`, 400));
        }
        return next(new ErrorHandler(error.message, 500));
    }
};

// ✅ Change Password
exports.changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        if (!currentPassword || !newPassword) {
            return next(new ErrorHandler("Please provide current and new passwords", 400));
        }

        const user = await User.findById(userId).select('+password');
        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return next(new ErrorHandler("Current password is incorrect", 401));
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.status(200).json({
            success: true,
            message: "Password changed successfully",
        });
    } catch (error) {
        console.error("Error changing password:", error); // Log the full error object
        // Handle Mongoose validation errors specifically
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return next(new ErrorHandler(`Validation Error: ${messages.join(', ')}`, 400));
        }
        return next(new ErrorHandler(error.message, 500));
    }
};


// ✅ Update Email
exports.updateEmail = async (req, res, next) => {
    try {
        const { email: newEmail } = req.body; // FIX: rename email to newEmail
        const userId = req.user.id;

        if (!newEmail) {
            return next(new ErrorHandler("New email is required", 400));
        }

        const existingUser = await User.findOne({ email: newEmail });
        if (existingUser && existingUser._id.toString() !== userId) {
            return next(new ErrorHandler("Email already in use by another account", 400));
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { email: newEmail },
            { new: true, runValidators: true }
        );

        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }

        res.status(200).json({
            success: true,
            message: "Email updated successfully",
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                address: user.address,
            },
        });
    } catch (error) {
        console.error("Error updating email:", error); // Log the full error object
        // Handle Mongoose validation errors specifically
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return next(new ErrorHandler(`Validation Error: ${messages.join(', ')}`, 400));
        }
        return next(new ErrorHandler(error.message, 500));
    }
};


// ✅ Update Username (New Feature)
exports.updateUsername = async (req, res, next) => {
    try {
        const { username } = req.body;
        const userId = req.user.id; // User ID from authenticated middleware

        if (!username) {
            return next(new ErrorHandler("Username is required", 400));
        }

        // Optional: Add validation for username uniqueness if desired
        // const existingUser = await User.findOne({ username });
        // if (existingUser && existingUser._id.toString() !== userId) {
        //    return next(new ErrorHandler("Username already taken", 400));
        // }

        const user = await User.findByIdAndUpdate(
            userId,
            { username: username },
            { new: true, runValidators: true }
        );

        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }

        res.status(200).json({
            success: true,
            message: "Username updated successfully",
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                address: user.address,
            },
        });
    } catch (error) {
        console.error("Error updating username:", error); // Log the full error object
        // Handle Mongoose validation errors specifically
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return next(new ErrorHandler(`Validation Error: ${messages.join(', ')}`, 400));
        }
        return next(new ErrorHandler(error.message, 500));
    }
};

// ✅ Get User Profile
exports.getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-password'); // Exclude password
        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }
        res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        console.error("Error getting user profile:", error);
        return next(new ErrorHandler(error.message, 500));
    }
};


// Delete account
exports.deleteAccount = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.user.id);
        res.status(200).json({ message: 'Account deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting account' });
    }
};
