import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if we are not already on login or public pages
      const publicPaths = ['/login', '/register', '/'];
      if (!publicPaths.includes(window.location.pathname) && !window.location.pathname.startsWith('/products')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
