import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    ThemeProvider,
    createTheme,
    CssBaseline,
} from '@mui/material';

const socket = io('http://localhost:5000');

// Create a custom Material-UI theme
const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2', // Blue color
        },
        background: {
            default: '#ffffff', // White background
        },
    },
    typography: {
        fontFamily: 'Roboto, Arial, sans-serif',
    },
});

const HomePage = () => {
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const joinChat = () => {
        if (!name.trim()) {
            setError('Name cannot be empty');
            return;
        }

        socket.emit('joinGroup', { name }, (response) => {
            if (response?.error) {
                setError(response.error);
            } else {
                navigate('/group', { state: { name } }); // Pass name to GroupPage
            }
        });
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    backgroundColor: 'background.default',
                    padding: 2,
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        padding: 4,
                        maxWidth: 400,
                        width: '100%',
                        textAlign: 'center',
                    }}
                >
                    <Typography variant="h4" component="h1" gutterBottom color="primary">
                        Enter Your Name
                    </Typography>
                    <TextField
                        fullWidth
                        variant="outlined"
                        label="Name"
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            setError(''); // Clear error on input change
                        }}
                        error={!!error}
                        helperText={error}
                        sx={{ marginBottom: 2 }}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={joinChat}
                        sx={{ padding: 1 }}
                    >
                        Join
                    </Button>
                </Paper>
            </Box>
        </ThemeProvider>
    );
};

export default HomePage;
