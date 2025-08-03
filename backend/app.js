const express = require('express');
const cors = require('cors');
const paymentRoutes = require('./routes/paymentRoute');
const cookieParser = require('cookie-parser');
const { errorMiddleware } = require('./error/error');
const app = express();


const authRoute = require('./routes/authRoute');
const reservationRoute = require('./routes/reservationRoute');
const orderRoutes = require('./routes/orderRoutes');


// Define all allowed origins, including your Vercel frontend URL
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:9000',
    process.env.FRONTEND_URL, // This should be your deployed Vercel frontend URL
];


// Debugging: Log the value of FRONTEND_URL and the full allowedOrigins array
console.log('DEBUG: Value of process.env.FRONTEND_URL on Render:', process.env.FRONTEND_URL);
console.log('DEBUG: Full allowedOrigins array on Render:', allowedOrigins);


app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        // or if the origin is in our allowed list
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'), false);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.get('/api/v1', (req, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome to API v1!"
    });
});

app.use('/api/v1/payment', paymentRoutes);
app.use('/api/v1/auth', authRoute);
app.use('/api/v1/reservation', reservationRoute);
app.use('/api/v1/orders', orderRoutes);


app.get('/api/test', (req, res) => {
    res.status(200).json({
        success: true,
        message: "API is working!"
    });
});


app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome to Restaurant Reservation API"
    });
});


app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Cannot ${req.method} ${req.originalUrl}`
    });
});


app.use(errorMiddleware);

module.exports = app;
