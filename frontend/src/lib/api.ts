import axios from 'axios';
import { getSession } from 'next-auth/react';

// Industrial-grade HTTP client configured for the Express backend
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10-second timeout to prevent hung requests
});

// Request Interceptor: Automatically inject the JWT token if on the client
api.interceptors.request.use(
  async (config) => {
    // Check if we are running in the browser (client-side)
    if (typeof window !== 'undefined') {
      const session = await getSession();
      if (session?.accessToken) {
        config.headers.Authorization = `Bearer ${session.accessToken}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Standardize error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code outside of 2xx
      const status = error.response.status;

      if (status === 401) {
        // Unauthorized - trigger client-side logout if needed
        // window.location.href = '/login'; // Optional: Auto redirect to login
        console.error('[API 401] Unauthorized action. Invalid token.');
      }

      if (status === 403) {
        console.error('[API 403] Forbidden. Insufficient RBAC privileges.');
      }
      
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('[API Network Error] No response received from server.');
      return Promise.reject({ message: 'Network error. Please try again later.' });
    } else {
      // Something happened in setting up the request
      return Promise.reject({ message: error.message });
    }
  }
);

/**
 * Server-side API fetcher.
 * Since `getSession` only works reliably on the client, Server Components
 * should manually pass the token extracted from `auth()`.
 */
export const serverApi = (token: string) => {
  const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    timeout: 10000,
  });

  instance.interceptors.response.use(
    (res) => res,
    (err) => Promise.reject(err.response?.data || err)
  );

  return instance;
};
