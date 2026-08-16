require("dotenv").config({ path: "./src/config/.env" });
const http = require('http');
const app = require('./app');
const connectDB = require('./db');
const cors = require('cors');
const mongoose = require('mongoose'); 
const socketConfig = require('./config/socket'); // Path fixed

const PORT = process.env.PORT || 4000;

app.use(cors());

const server = http.createServer(app);
socketConfig.init(server);

connectDB();

mongoose.connection.once('open', async () => {
    try {
        console.log('MongoDB connection verified. Synchronizing spatial data layers...');
        
        await mongoose.model('Restaurant').syncIndexes();
        await mongoose.model('User').syncIndexes();
        await mongoose.connection.collections['orders'].dropIndex('user_1').catch(() => {});
        
        console.log('GeoJSON Proximity Spatial Indices successfully synchronized.');
    } catch (error) {
        console.error('Spatial structural indexing layout mismatch error:', error.message);
    }
});


server.listen(PORT, () => {
    console.log(`Server & WebSocket Engine running on port ${PORT}`); // Backticks added
});