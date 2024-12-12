import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import {
    Box,
    Typography,
    TextField,
    Button,
    List,
    ListItem,
    ListItemText,
    ThemeProvider,
    createTheme,
    CssBaseline,
} from '@mui/material';

const socket = io('http://localhost:5000', {
    transports: ['websocket', 'polling'], // Specify transport methods
});

// Define the custom theme
const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2', // Blue theme
        },
        secondary: {
            main: '#f50057', // Red theme for distinction
        },
        background: {
            default: '#f5f5f5', // Light gray for the background
        },
    },
    typography: {
        fontFamily: 'Roboto, Arial, sans-serif',
    },
});

const OneToOnePage = () => {
    const { currentUser, selectedUser } = useParams(); // Extract params from the URL
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');

    // Fetch initial messages from the backend when the component loads
    useEffect(() => {
        socket.emit('joinGroup', { selectedUser });

        const fetchPrivateMessages = async (from, to) => {
            try {
                const response = await fetch(
                    `http://localhost:5000/api/privateMessages/${from}/${to}`
                );
                const data = await response.json();
                setMessages(data); // Load the messages into the UI
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        };

        fetchPrivateMessages(currentUser, selectedUser);
    }, [currentUser, selectedUser]);

    // Listen for real-time messages from the socket
    useEffect(() => {
        socket.on('privateMessage', (newMessage) => {
            if (
                newMessage.users.includes(currentUser) &&
                newMessage.users.includes(selectedUser)
            ) {
                setMessages((prev) => [...prev, newMessage]);
            }
        });

        return () => {
            socket.off('privateMessage');
        };
    }, [currentUser, selectedUser]);

    // Send a new private message
    const sendMessage = () => {
        if (message.trim()) {
            const newMessage = {
                from: currentUser,
                to: selectedUser,
                message,
                time: new Date().toISOString(), // Ensure consistent formatting
            };
            socket.emit('privateMessage', newMessage);
            // setMessages((prev) => [...prev, newMessage]); // Optimistic UI update
            setMessage(''); // Clear input field
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box p={3} bgcolor="background.default" minHeight="100vh">
                <Typography
                    variant="h5"
                    align="center"
                    color="primary"
                    gutterBottom
                >
                    {`Chat with ${selectedUser}`}
                </Typography>
                <List
                    sx={{
                        maxHeight: '60vh',
                        overflowY: 'auto',
                        mt: 2,
                        bgcolor: '#ffffff',
                        borderRadius: 1,
                        p: 2,
                    }}
                >
                    {messages.map((msg, index) => (
                        <ListItem key={index}>
                            <ListItemText
                                primary={
                                    <>
                                        <Typography
                                            color={
                                                msg?.user === currentUser
                                                    ? 'primary'
                                                    : 'secondary'
                                            }
                                            fontWeight="bold"
                                        >
                                            {msg?.user === currentUser
                                                ? 'You'
                                                : msg?.user}
                                        </Typography>
                                        <Typography
                                            color="textSecondary"
                                            sx={{ whiteSpace: 'pre-line' }}
                                        >
                                            {msg?.message}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            color="textSecondary"
                                        >
                                            {new Date(msg.date).toLocaleString()}
                                        </Typography>
                                    </>
                                }
                            />
                        </ListItem>
                    ))}
                </List>
                <Box display="flex" mt={2} gap={2}>
                    <TextField
                        fullWidth
                        label="Enter message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        variant="outlined"
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={sendMessage}
                    >
                        Send
                    </Button>
                </Box>
            </Box>
        </ThemeProvider>
    );
};

export default OneToOnePage;
