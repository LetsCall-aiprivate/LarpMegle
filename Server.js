const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');

app.use(express.static('public'));

let waitingUser = null;

io.on('connection', (socket) => {
    console.log('User connected: ' + socket.id);

    if (waitingUser) {
        // Match found!
        const partnerId = waitingUser;
        waitingUser = null;

        socket.join(partnerId);
        io.to(partnerId).emit('startcall', socket.id);
        socket.emit('startcall', partnerId);
    } else {
        waitingUser = socket.id;
        socket.emit('waiting', 'Searching for a partner...');
    }

    socket.on('disconnect', () => {
        if (waitingUser === socket.id) waitingUser = null;
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
