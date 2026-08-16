const { Server } = require('socket.io');

let io;

module.exports = {
    init: (httpServer) => {
        io = new Server(httpServer, {
            cors: {
                origin: "*", 
                methods: ["GET", "POST", "PUT", "PATCH"]
            }
        });

        io.on('connection', (socket) => {
            console.log(`⚡ Client connected: ${socket.id}`);

            
            socket.on('joinOrderRoom', (orderId) => {
                socket.join(orderId);
                console.log(`📌 Socket ${socket.id} joined tracking room for Order: ${orderId}`);
            });

            socket.on('disconnect', () => {
                console.log(`❌ Client disconnected: ${socket.id}`);
            });
        });

        return io;
    },
    getIO: () => {
        if (!io) {
            throw new Error("Socket.io is not initialized!");
        }
        return io;
    }
};