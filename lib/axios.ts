import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { getSession } from "next-auth/react";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for API calls
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Try to get session in client-side context
    try {
      const session = await getSession();

      if (session?.user) {
        // Set auth header if session exists
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${session.user.id}`;
      }
    } catch (error) {
      console.error("Error getting session in axios interceptor:", error);
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 errors - could implement token refresh here
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Mark request as retried to avoid infinite loops
      originalRequest._retry = true;

      // Could implement token refresh here
      // For now, just reject and let the application handle auth errors
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
