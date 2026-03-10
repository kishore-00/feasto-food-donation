require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { startExpiryChecker } = require('./utils/expiryChecker');

// Connect to Database
connectDB();

// Start the expiry notification service
startExpiryChecker();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/listings', require('./routes/listingRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Root Endpoint
app.get('/', (req, res) => {
    res.send('Surplus Food Platform API is running');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
