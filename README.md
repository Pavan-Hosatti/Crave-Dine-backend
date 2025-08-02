Restaurant Reservation & Order Backend API 🍽️
This repository hosts the robust and scalable backend API for a modern full-stack restaurant application. Engineered with Node.js, Express.js, and MongoDB (Mongoose), it delivers a comprehensive suite of functionalities designed to power a seamless dining and ordering experience.

✨ Features
This backend is the central engine, providing a rich set of features:

Secure User Authentication & Authorization:

JWT (JSON Web Token)-based authentication for secure user registration, login, and session management.

Seamless integration with Google OAuth and Firebase Authentication for flexible sign-in options.

Middleware for protected routes ensuring only authorized users can access specific functionalities.

Comprehensive Reservation System:

Allows users to book, view, and manage table reservations effortlessly.

Generates unique table numbers for each reservation.

Dynamic Order Management:

Handles the complete lifecycle of food orders, from creation to various status updates (e.g., Placed, Confirmed, Preparing, Out for Delivery, Delivered, Cancelled).

Tracks order history for users.

Integrated Payment Gateway:

Securely processes online payments via Razorpay, providing a smooth checkout experience.

User Profile Management:

Endpoints for users to securely update personal information, including username, email, password, and delivery addresses.

Centralized Error Handling:

Custom error handling middleware ensures consistent, secure, and user-friendly error responses across the API.

Database Integration:

Utilizes MongoDB as the NoSQL database, with Mongoose for object data modeling, ensuring efficient and flexible data storage.

Cross-Origin Resource Sharing (CORS):

Properly configured to allow secure communication with the frontend application.

🚀 Technologies Used
Node.js: JavaScript runtime environment.

Express.js: Fast, unopinionated, minimalist web framework for Node.js.

MongoDB: NoSQL database for flexible data storage.

Mongoose: MongoDB object data modeling (ODM) for Node.js.

JSON Web Tokens (JWT): For secure authentication.

Firebase Admin SDK: For Google OAuth and other Firebase services.

Razorpay: For payment gateway integration.

Bcrypt.js: For password hashing.

Cookie-parser: For parsing cookies.

CORS: Middleware for enabling cross-origin requests.
