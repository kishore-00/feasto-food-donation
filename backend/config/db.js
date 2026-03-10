const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Force index sync in development
        if (process.env.NODE_ENV === 'development') {
            await mongoose.connection.syncIndexes();
            console.log('Database indexes synchronized');
        }
    } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
