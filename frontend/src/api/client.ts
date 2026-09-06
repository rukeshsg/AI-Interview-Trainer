import axios from 'axios';

const client = axios.create({
  baseURL: '/api',
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
