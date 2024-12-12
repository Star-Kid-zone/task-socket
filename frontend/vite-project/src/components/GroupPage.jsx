import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import {
    Box,
    Typography,
    TextField,
    Button,
    List,
    ListItem,
    ListItemText,
    Paper,
} from '@mui/material';
import axios from 'axios';

const socket = io('http://localhost:5000');

const GroupPage = () => {
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [message, setMessage] = useState('');
    const location = useLocation();
    const navigate = useNavigate();
    const name = location.state?.name || 'Guest';

    useEffect(() => {
        // Fetch initial data
        const fetchData = async () => {
            try {
                const [usersRes, messagesRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/users'),
                    axios.get('http://localhost:5000/api/groupMessages'),
                ]);
                setUsers(usersRes.data);
                setMessages(messagesRes.data);
            } catch (err) {
                console.error('Error fetching initial data:', err);
            }
        };

        fetchData();

        // Socket event listeners
        socket.on('updateUsers', (userList) => setUsers(userList));
        socket.on('updateGroupMessages', (groupMessages) => setMessages(groupMessages));

        // Join group chat
        socket.emit('joinGroup', { name });

        return () => {
            socket.off('updateUsers');
            socket.off('updateGroupMessages');
        };
    }, [name]);

    const sendMessage = () => {
        if (message.trim()) {
            socket.emit('sendGroupMessage', { name, message });
            setMessage('');
        }
    };

    const goToPrivateChat = (user) => {
        if (user.name !== name) {
            navigate(`/one-to-one/${name}/${user.name}`); // Pass users as URL parameters
        }
    };

    return (
        <Box p={3} bgcolor="#f5f5f5" height="100vh" width="100%">
            <Typography variant="h4" align="center" color="primary" gutterBottom>
                Group Chat
            </Typography>
            <Box display="flex" gap={2}>
                {/* User List */}
                <Paper elevation={3} sx={{ flex: 1, p: 2 }}>
                    <Typography variant="h6" color="secondary" gutterBottom>
                        Users
                    </Typography>
                    <List>
                        {users.map((user, index) => (
                            <ListItem
                                button
                                key={index}
                                onClick={() => goToPrivateChat(user)}
                                sx={{
                                    bgcolor: user.name === name ? '#e3f2fd' : 'inherit',
                                    borderRadius: 1,
                                    mb: 1,
                                }}
                            >
                                <ListItemText primary={user.name} />
                            </ListItem>
                        ))}
                    </List>
                </Paper>

                {/* Chat Messages */}
                <Paper elevation={3} sx={{ flex: 3, p: 2 }}>
                    <Typography variant="h6" color="secondary" gutterBottom>
                        Messages
                    </Typography>
                    <Box
                        sx={{
                            maxHeight: '60vh',
                            overflowY: 'auto',
                            mb: 2,
                            bgcolor: '#ffffff',
                            borderRadius: 1,
                            p: 2,
                        }}
                    >
                        <List>
                            {messages.map((msg, index) => (
                                <ListItem key={index} sx={{ mb: 1 }}>
                                    <ListItemText
                                        primary={
                                            <Typography
                                                color="primary"
                                                fontWeight="bold"
                                            >
                                                {msg.name}
                                            </Typography>
                                        }
                                        secondary={
                                            <Typography
                                                color="textSecondary"
                                                sx={{ whiteSpace: 'pre-line' }}
                                            >
                                                {msg.message}
                                            </Typography>
                                        }
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Box>

                    {/* Message Input */}
                    <Box display="flex" gap={2}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            label="Enter your message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={sendMessage}
                            sx={{ minWidth: '120px' }}
                        >
                            Send
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
};

export default GroupPage;
