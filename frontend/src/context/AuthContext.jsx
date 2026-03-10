import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const API_URL = 'http://localhost:5000/api/auth';

    useEffect(() => {
        const checkLoggedIn = async () => {
            const token = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            if (token && storedUser) {
                try {
                    // Pre-emptively set header
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                    // Simple validation: try to get user info or just check if it's malformed
                    // For now, we'll keep the session but adding a hook to handle 401 globally
                    setUser(JSON.parse(storedUser));
                } catch (err) {
                    console.error("Token restoration failed", err);
                    logout();
                }
            }
            setLoading(false);
        };
        checkLoggedIn();

        // Global interceptor for 401s
        const interceptor = axios.interceptors.response.use(
            response => response,
            error => {
                if (error.response?.status === 401 &&
                    (error.response?.data?.message === 'Not authorized, token failed' ||
                        error.response?.data?.message === 'Not authorized, no token')) {
                    logout();
                    window.location.href = '/login?expired=true';
                }
                return Promise.reject(error);
            }
        );

        return () => axios.interceptors.response.eject(interceptor);
    }, []);

    const login = async (email, password) => {
        // Implementation for phase 5 integration
        // Actually hitting backend
        try {
            // For MVP development speed, we might not have a login endpoint that returns the user profile alone
            // We'll use the register response structure or assume login works
            // We need to add a login endpoint to backend first! 
            // Temporarily implementing a simple Login API call
            const res = await axios.post(`${API_URL}/login`, { email, password });

            if (res.data) {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(res.data));
                axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
                setUser(res.data);
                return { success: true };
            }
        } catch (error) {
            console.error("Login failed", error.response?.data);
            return { success: false, error: error.response?.data?.message || 'Login failed' };
        }
    };

    const register = async (userData) => {
        try {
            const res = await axios.post(`${API_URL}/register`, userData);
            if (res.data) {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(res.data));
                axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
                setUser(res.data);
                return { success: true };
            }
        } catch (error) {
            console.error("Registration failed", error);
            const message = error.response?.data?.message || (error.message === "Network Error" ? "Network Error - Backend might be down" : error.message) || 'Registration failed';
            return { success: false, error: message };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
