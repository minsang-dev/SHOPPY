import axios, { type AxiosRequestConfig, type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { refreshAccessToken } from '@/entities/user/api/authApi';
import { useAuthStore } from '@/entities/user/model/useAuthStore';

export type ApiSuccessResponse<T> = {
  status: 'success';
  message: string;
  data: T;
};

export type ApiFailResponse = {
  status: 'fail';
  errorCode: string;
  message: string;
  data: unknown | null;
  HTTP?: string | number;
  error?: unknown;
};

export type ApiError = {
  statusCode: number | null;
  errorCode: string | null;
  message: string;
  data?: unknown | null;
  httpStatus?: number | null;
};

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 토큰 갱신 상태 관리
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (token) {
      promise.resolve(token);
    } else {
      promise.reject(error);
    }
  });
  failedQueue = [];
};

// 401 에러 시 토큰 갱신 interceptor
http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return http(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const storedRefreshToken = sessionStorage.getItem('refreshToken');

      if (!storedRefreshToken) {
        isRefreshing = false;
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
        sessionStorage.removeItem('user');
        window.location.href = '/';
        return Promise.reject(error);
      }

      try {
        const { accessToken, refreshToken } = await refreshAccessToken(storedRefreshToken);

        sessionStorage.setItem('accessToken', accessToken);
        sessionStorage.setItem('refreshToken', refreshToken);
        useAuthStore.getState().setAccessToken(accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        processQueue(null, accessToken);

        return http(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
        sessionStorage.removeItem('user');
        window.location.href = '/';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export type ApiRequestOptions = {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  url: string;
  data?: unknown;
  params?: Record<string, unknown>;
  auth?: boolean;
  config?: AxiosRequestConfig;
};

const buildUrl = (url: string) => (url.startsWith('/api') ? url : `/api${url}`);

const toApiError = (payload: ApiFailResponse, httpStatus?: number | null): ApiError => ({
  statusCode: httpStatus ?? null,
  errorCode: payload.errorCode ?? null,
  message: payload.message || 'API error',
  data: payload.data ?? null,
  httpStatus: httpStatus ?? null,
});

export const apiRequest = async <T>(options: ApiRequestOptions): Promise<T> => {
  const { method, url, data, params, auth = true, config } = options;

  const token = sessionStorage.getItem('accessToken');
  const headers = {
    ...(config?.headers ?? {}),
    ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
  };

  try {
    const response = await http.request<ApiSuccessResponse<T> | ApiFailResponse>({
      method,
      url: buildUrl(url),
      data,
      params,
      ...config,
      headers,
    });

    if (response.data && response.data.status === 'success') {
      return response.data.data as T;
    }

    throw toApiError(response.data as ApiFailResponse, response.status);
  } catch (error: unknown) {
    const axiosError = error as { response?: { status?: number; data?: unknown }; message?: string };
    const status = axiosError?.response?.status ?? null;
    const payload = axiosError?.response?.data;

    if (payload && typeof payload === 'object' && 'status' in payload && payload.status === 'fail') {
      throw toApiError(payload as ApiFailResponse, status);
    }

    throw {
      statusCode: status,
      errorCode: null,
      message: axiosError?.message || 'Network error',
      data: payload ?? null,
      httpStatus: status,
    } as ApiError;
  }
};
