import axios from 'axios';
import { mockAPI } from './mockApi';

const API_BASE_URL = '/api';

// Check if we should use mock API (backend unavailable)
let useMockAPI = false;

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 5000, // 5 second timeout
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle auth errors and switch to mock if backend unavailable
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK' || !error.response) {
            console.log('Backend unavailable, switching to demo mode');
            useMockAPI = true;
        }
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: async (data) => {
        if (useMockAPI) return mockAPI.register(data);
        try {
            return await api.post('/auth/register', data);
        } catch (e) {
            if (e.code === 'ERR_NETWORK') {
                useMockAPI = true;
                return mockAPI.register(data);
            }
            throw e;
        }
    },
    login: async (data) => {
        if (useMockAPI) return mockAPI.login(data);
        try {
            return await api.post('/auth/login', data);
        } catch (e) {
            if (e.code === 'ERR_NETWORK') {
                useMockAPI = true;
                return mockAPI.login(data);
            }
            throw e;
        }
    },
};

// Expenses API with mock fallback
export const expenseAPI = {
    getAll: async () => {
        if (useMockAPI) return mockAPI.getAll();
        try {
            return await api.get('/expenses');
        } catch (e) {
            useMockAPI = true;
            return mockAPI.getAll();
        }
    },
    getById: async (id) => {
        if (useMockAPI) return mockAPI.getById(id);
        try {
            return await api.get(`/expenses/${id}`);
        } catch (e) {
            useMockAPI = true;
            return mockAPI.getById(id);
        }
    },
    create: async (data) => {
        if (useMockAPI) return mockAPI.create(data);
        try {
            return await api.post('/expenses', data);
        } catch (e) {
            useMockAPI = true;
            return mockAPI.create(data);
        }
    },
    update: (id, data) => api.put(`/expenses/${id}`, data),
    delete: async (id) => {
        if (useMockAPI) return mockAPI.delete(id);
        try {
            return await api.delete(`/expenses/${id}`);
        } catch (e) {
            useMockAPI = true;
            return mockAPI.delete(id);
        }
    },
    getByMonth: async (year, month) => {
        if (useMockAPI) return mockAPI.getByMonth(year, month);
        try {
            return await api.get(`/expenses/month?year=${year}&month=${month}`);
        } catch (e) {
            useMockAPI = true;
            return mockAPI.getByMonth(year, month);
        }
    },
    getByCategory: (category) => api.get(`/expenses/category/${category}`),
    getByDateRange: (startDate, endDate) =>
        api.get(`/expenses/range?startDate=${startDate}&endDate=${endDate}`),
    getSummary: async () => {
        if (useMockAPI) return mockAPI.getSummary();
        try {
            return await api.get('/expenses/summary');
        } catch (e) {
            useMockAPI = true;
            return mockAPI.getSummary();
        }
    },
    getCategories: async () => {
        if (useMockAPI) return mockAPI.getCategories();
        try {
            return await api.get('/expenses/categories');
        } catch (e) {
            useMockAPI = true;
            return mockAPI.getCategories();
        }
    },
    exportCsv: async () => {
        if (useMockAPI) return mockAPI.exportCsv();
        try {
            return await api.get('/expenses/export/csv', { responseType: 'blob' });
        } catch (e) {
            useMockAPI = true;
            return mockAPI.exportCsv();
        }
    },
    getPythonAnalytics: () => api.post('/expenses/analytics/python'),
    getCppCalculations: () => api.post('/expenses/analytics/cpp'),
};

// Check if using mock
export const isUsingMockAPI = () => useMockAPI;
export const setMockMode = (value) => { useMockAPI = value; };

export default api;
