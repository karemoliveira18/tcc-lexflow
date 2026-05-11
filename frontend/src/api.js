import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ===== AUTH ENDPOINTS =====
export const authAPI = {
  register: (email, password, nome, perfil = 'usuario') =>
    api.post('/auth/register', { email, password, nome, perfil }),
  
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  
  getProfile: () =>
    api.get('/auth/profile'),
};

// ===== PROCESSOS ENDPOINTS =====
export const processosAPI = {
  getAllProcessos: () =>
    api.get('/processos'),
  
  getProcessoById: (id) =>
    api.get(`/processos/${id}`),
  
  createProcesso: (data) =>
    api.post('/processos', data),
  
  updateProcesso: (id, data) =>
    api.put(`/processos/${id}`, data),
  
  deleteProcesso: (id) =>
    api.delete(`/processos/${id}`),
};

// ===== CLIENTES ENDPOINTS =====
export const clientesAPI = {
  getAllClientes: () =>
    api.get('/clientes'),
  
  getClienteById: (id) =>
    api.get(`/clientes/${id}`),
  
  createCliente: (data) =>
    api.post('/clientes', data),
  
  updateCliente: (id, data) =>
    api.put(`/clientes/${id}`, data),
  
  deleteCliente: (id) =>
    api.delete(`/clientes/${id}`),
};

// ===== DASHBOARD ENDPOINTS =====
export const dashboardAPI = {
  getMetrics: () =>
    api.get('/dashboard/metrics'),
};

export default api;