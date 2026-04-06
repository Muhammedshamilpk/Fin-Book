import axios from 'axios';

const getBaseURL = () => {
  let url = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  
  // Ensure the URL ends with /api/v1/
  if (!url.includes('/api/v1')) {
    // Strip trailing slash if it exists, then append /api/v1/
    url = url.replace(/\/$/, '') + '/api/v1/';
  } else if (!url.endsWith('/')) {
    url += '/';
  }
  
  return url;
};

export const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
