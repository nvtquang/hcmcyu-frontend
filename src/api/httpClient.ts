import axios from 'axios';
import { env } from './config';
import { tokenStorage } from './tokenStorage';
import type { AuthResponse } from '../types/auth';

export const httpClient = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

httpClient.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

let refreshPromise: Promise<AuthResponse> | null = null;

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const originalRequest = error.config;
      const refreshToken = tokenStorage.getRefreshToken();

      if (refreshToken && !originalRequest?._retry && !originalRequest?.url?.includes('/api/auth/refresh')) {
        originalRequest._retry = true;
        refreshPromise ??= httpClient
          .post<AuthResponse>('/api/auth/refresh', { refreshToken })
          .then((response) => {
            tokenStorage.setAccessToken(response.data.accessToken);
            tokenStorage.setRefreshToken(response.data.refreshToken);
            return response.data;
          })
          .finally(() => {
            refreshPromise = null;
          });

        const refreshed = await refreshPromise;
        originalRequest.headers.Authorization = `Bearer ${refreshed.accessToken}`;
        return httpClient(originalRequest);
      }

      tokenStorage.clear();
    }

    return Promise.reject(error);
  },
);
