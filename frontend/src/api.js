import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, '');
if (!API_BASE_URL) throw new Error('Configure VITE_API_URL antes de iniciar ou gerar a build.');

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
    const status = error.response?.status;

    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      const loginPath = `${import.meta.env.BASE_URL}login`;
      if (window.location.pathname !== loginPath) {
        window.location.assign(loginPath);
      }
    }

    if (status !== 403) {
      console.error('API Error:', error.response?.data || error.message);
    }

    return Promise.reject(error);
  }
);

// ===== AUTH ENDPOINTS =====
export const authAPI = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }),

  getProfile: () =>
    api.get('/auth/profile'),
};

// ===== USERS ENDPOINTS =====
export const usersAPI = {
  getAllUsers: (params = {}) =>
    api.get('/users', { params }),

  getUserById: (id) =>
    api.get(`/users/${id}`),

  createUser: (data) =>
    api.post('/users', data),

  updateUser: (id, data) =>
    api.put(`/users/${id}`, data),

  toggleUserStatus: (id, data) =>
    api.patch(`/users/${id}/status`, data),
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