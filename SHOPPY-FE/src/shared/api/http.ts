import axios, { type AxiosRequestConfig } from 'axios';

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

  const token = localStorage.getItem('accessToken');
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
  } catch (error: any) {
    const status = error?.response?.status ?? null;
    const payload = error?.response?.data;

    if (payload?.status === 'fail') {
      throw toApiError(payload as ApiFailResponse, status);
    }

    throw {
      statusCode: status,
      errorCode: null,
      message: error?.message || 'Network error',
      data: payload ?? null,
      httpStatus: status,
    } as ApiError;
  }
};
