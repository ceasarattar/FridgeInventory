import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './LoginScreen.css';

const Login = () => {
    const [username, setUsername] = useState(''); 
    const [password, setPassword] = useState(''); 
    const [error, setError] = useState(''); 

    const navigate = useNavigate(); 

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            console.log('Attempting login with:', { user_name: username, passcode: password });

            // Make the login request
            const response = await axios.post('http://localhost:3001/login', {
                user_name: username,
                passcode: password,
            });

            console.log('Login API response:', response.data);

            // Validate the response structure
            if (response.data && response.data.user_id) {
                const { user_id } = response.data;

                console.log('Login successful! User ID:', user_id);

                // Store user_id in localStorage
                localStorage.setItem('user_id', user_id);

                // Navigate to the home page
                navigate('/home');
            } else {
                console.error('Invalid response structure from API:', response.data);
                setError('Unexpected response from the server.');
            }
        } catch (err) {
            console.error('Error during login:', err.response || err.message);

            // Handle server errors
            if (err.response && err.response.data) {
                setError(err.response.data.message || 'Invalid username or password');
            } else {
                setError('An error occurred while logging in.');
            }
        }
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            <form onSubmit={handleLogin} className="login-form">
                {error && <p style={{ color: 'red' }}>{error}</p>} {}
                <div className="form-group">
                    <label htmlFor="username">Username:</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)} 
                        required
                    />
                </div>
                <button type="submit" className="login-button">Login</button>
            </form>
        </div>
    );
};

export default Login;
