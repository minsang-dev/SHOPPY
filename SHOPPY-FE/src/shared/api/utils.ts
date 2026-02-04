import { apiRequest } from './http';

export const apiGet = async <T>(url: string, params?: Record<string, unknown>, auth = true) =>
  apiRequest<T>({ method: 'GET', url, params, auth });

export const apiPost = async <T>(url: string, data?: unknown, auth = true) =>
  apiRequest<T>({ method: 'POST', url, data, auth });

export const apiPut = async <T>(url: string, data?: unknown, auth = true) =>
  apiRequest<T>({ method: 'PUT', url, data, auth });

export const apiPatch = async <T>(url: string, data?: unknown, auth = true) =>
  apiRequest<T>({ method: 'PATCH', url, data, auth });

export const apiDelete = async <T>(url: string, params?: Record<string, unknown>, auth = true) =>
  apiRequest<T>({ method: 'DELETE', url, params, auth });
