import axios from "axios";
import { API_CONFIG } from "../config/api.config";

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // لو الـ request ده هو login نفسه، مترجعش refresh
    const isAuthRequest =
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/refresh");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthRequest
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");
        const response = await axios.post(
          `${API_CONFIG.BASE_URL}/auth/refresh`,
          { refresh_token: refreshToken },
        );

        const { access_token } = response.data.data;
        localStorage.setItem("access_token", access_token);
        originalRequest.headers.Authorization = `Bearer ${access_token}`;

        return api(originalRequest);
      } catch {
        localStorage.clear();
        window.location.href = "/login";
      }
    }

    return Promise.reject(
      error.response?.data?.message || "حدث خطأ، حاول مرة أخرى",
    );
  },
);

export default api;
