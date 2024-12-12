const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', methods: ['GET', 'POST'],
    },
});

app.use(cors());
app.use(express.json());

// In-memory storage
const users = [];
const groupMessages = [];
const privateMessages = []; // Store private messages in the desired format
const userSockets = {}; // Track users by socket ID

// Routes
app.get('/', (req, res) => {
    res.send('Chat Application Backend');
});

// Fetch all users
app.get('/api/users', (req, res) => {
    res.json(users);
});

// Fetch all group messages
app.get('/api/groupMessages', (req, res) => {
    res.json(groupMessages);
});

// Fetch private messages between two users
app.get('/api/privateMessages/:from/:to', (req, res) => {
    const { from, to } = req.params;
    const messages = privateMessages.filter((msg) => msg.users.includes(from) && msg.users.includes(to));
    res.json(messages);
});

// Socket.io logic
io.on('connection', (socket) => {

    // Handle user joining
    socket.on('joinGroup', ({ name }, callback) => {
        if (!name || name.trim() === '') {
            if (typeof callback === 'function') {
                return callback({ error: 'Name is required' });
            }
            return;
        }

        const userExists = users.find((user) => user.name === name);
        if (userExists) {
            if (typeof callback === 'function') {
                return callback({ error: 'Name is already taken' });
            }
            return;
        }

        const newUser = { id: socket.id, name };
        users.push(newUser);
        userSockets[name] = socket.id; // Map the user's name to their socket ID

        io.emit('updateUsers', users); // Broadcast updated users
        if (typeof callback === 'function') {
            callback({ success: true });
        }
    });

    socket.on('sendGroupMessage', ({ name, message }) => {
        const newMessage = { name, message };
        groupMessages.push(newMessage);
        io.emit('updateGroupMessages', groupMessages);
    });

    socket.on('privateMessage', ({ from, to, message, time }) => {
        const newMessage = {
            users: [from, to],
            message,
            user: from,
            date: time,
        };
        privateMessages.push(newMessage);

        const targetSocketId = userSockets[to];
        if (targetSocketId) {
            io.emit('privateMessage', newMessage);
        }


    });


    socket.on('disconnect', () => {
        const user = users.find((user) => user.id === socket.id);
        if (user) {
            users.splice(users.indexOf(user), 1);
            delete userSockets[user.name];
            io.emit('updateUsers', users);
        }
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});