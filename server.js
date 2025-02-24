const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
server.listen(3000, '0.0.0.0', () => {
    console.log('Server running on port 3000');
});

const io = socketIo(server, {
    cors: {
        origin: "*", // Adjust as needed, or make it more restrictive
        methods: ["GET", "POST"]
    }
});

let lineHistory = []; // Store all lines drawn on the canvas

io.on('connection', (socket) => {
    console.log('A new user connected, sending current line history.');

    // Debugging: Log the current line history on new connection
    console.log(`Current line history length: ${lineHistory.length}`);

    socket.emit('load', lineHistory);

    socket.on('draw_line', (data) => {
        lineHistory.push(data);
        io.emit('draw_line', data);
    });

    socket.on('clear_board', () => {
        console.log('Received clear_board event'); // Debugging
        lineHistory = [];
        io.emit('clear_board');
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

// const PORT = 3000;
// server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
