const mongoose = require('mongoose');

const connectDB = async() => {
    if(mongoose.connection.readyState >= 1) return;
    try {
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGO_URL);
        console.log('MongoDB connected');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        //process.exit(1);
    }
}
module.exports = connectDB
