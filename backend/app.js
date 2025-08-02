const express = require('express');
const cors = require('cors');
const paymentRoutes = require('./routes/paymentRoute');
const cookieParser = require('cookie-parser');
const { errorMiddleware } = require('./error/error');
const app = express();


const authRoute = require('./routes/authRoute');
const reservationRoute = require('./routes/reservationRoute');
const orderRoutes = require('./routes/orderRoutes');


const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    process.env.FRONTEND_URL,
];


app.use(cors({
    origin: allowedOrigins,
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
app.use('/api/auth', authRoute);
app.use('/api/v1/reservation', reservationRoute);
app.use('/api/orders', orderRoutes);


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