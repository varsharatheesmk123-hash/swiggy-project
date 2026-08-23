const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authroutes');
const restaurantRoutes = require('./routes/restaurantroutes');
const app = express();
const connectDB = require('./db');


app.use(cors());
app.use(express.json());
app.use(async (req, res, next) => {
    try{
        await connectDB();
        next();
    } catch (error) {
        res.status(500).json({success: false, message: "Database Connection Error", error: error.message });
    }
});
app.use("/api/auth", authRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/menu", require('./routes/menuRoutes'));
app.use("/api/cart", require('./routes/cartroute'));
app.use("/api/orders", require('./routes/orderroute'));
app.use("/api/admin", require('./routes/Adminroute'));
app.use("/api/delivery", require('./routes/deliveryRoute'));
app.get('/', (req, res) => {
    res.status(200).json({ success: true, message: 'Welcome to Swiggy API' });
});

module.exports = app;
