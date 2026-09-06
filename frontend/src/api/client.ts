import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api` : '/api',
  timeout: 90000,
  headers: { 'Content-Type': 'application/json' },
});

// Response interceptor — passes errors cleanly to callers without global duplicate toast popup
client.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export default client;
