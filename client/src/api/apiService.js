import axios from 'axios';

const API_BASE_URL = 'https://sportapp-server.onrender.com';

export const apiService = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// קביעת Authorization Header
export const setAuthToken = (token) => {
  if (token) {
    apiService.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiService.defaults.headers.common['Authorization'];
  }
};
