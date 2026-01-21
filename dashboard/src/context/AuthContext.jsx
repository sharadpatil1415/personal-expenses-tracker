import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

// Demo user for when backend is unavailable
const DEMO_USER = {
    userId: 1,
    username: 'demo',
    email: 'demo@example.com',
    role: 'USER'
};
const DEMO_TOKEN = 'demo-jwt-token-for-local-testing';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [demoMode, setDemoMode] = useState(false);

    useEffect(() => {
        // Check for existing session
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
            setUser(JSON.parse(storedUser));
            // Check if we're in demo mode
            if (token === DEMO_TOKEN) {
                setDemoMode(true);
            }
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const response = await authAPI.login({ username, password });
            const { token, userId, username: uname, email, role } = response.data.data;

            const userData = { userId, username: uname, email, role };

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);

            return { success: true };
        } catch (error) {
            // If network error or backend unavailable, try demo login
            if (error.code === 'ERR_NETWORK' || error.message?.includes('Network') || !error.response) {
                console.log('Backend unavailable, trying demo mode...');
                return loginDemo(username, password);
            }

            // Check for 500 error (proxy error when backend down)
            if (error.response?.status >= 500) {
                console.log('Backend error, trying demo mode...');
                return loginDemo(username, password);
            }

            const message = error.response?.data?.message || 'Login failed';
            return { success: false, error: message };
        }
    };

    const loginDemo = (username, password) => {
        // Validate demo credentials locally
        if (username === 'demo' && password === 'demo123') {
            localStorage.setItem('token', DEMO_TOKEN);
            localStorage.setItem('user', JSON.stringify(DEMO_USER));
            setUser(DEMO_USER);
            setDemoMode(true);
            console.log('Demo mode login successful!');
            return { success: true, demoMode: true };
        }
        return { success: false, error: 'Invalid credentials. Try demo/demo123' };
    };

    const register = async (userData) => {
        try {
            const response = await authAPI.register(userData);
            const { token, userId, username, email, role } = response.data.data;

            const user = { userId, username, email, role };

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);

            return { success: true };
        } catch (error) {
            // If backend unavailable, create demo account
            if (error.code === 'ERR_NETWORK' || error.response?.status >= 500) {
                const demoUser = {
                    userId: Date.now(),
                    username: userData.username,
                    email: userData.email,
                    role: 'USER'
                };
                localStorage.setItem('token', DEMO_TOKEN);
                localStorage.setItem('user', JSON.stringify(demoUser));
                setUser(demoUser);
                setDemoMode(true);
                return { success: true, demoMode: true };
            }

            const message = error.response?.data?.message || 'Registration failed';
            return { success: false, error: message };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setDemoMode(false);
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        demoMode,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
