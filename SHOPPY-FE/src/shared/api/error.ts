import type { ApiError } from './http';

export type NormalizedApiError = {
  statusCode: number | null;
  errorCode: string | null;
  message: string;
  data?: unknown | null;
};

export const normalizeApiError = (error: unknown): NormalizedApiError => {
  const apiError = error as ApiError;
  if (apiError && typeof apiError === 'object' && 'message' in apiError) {
    return {
      statusCode: apiError.statusCode ?? null,
      errorCode: apiError.errorCode ?? null,
      message: apiError.message || 'Unknown error',
      data: apiError.data ?? null,
    };
  }

  return {
    statusCode: null,
    errorCode: null,
    message: 'Unknown error',
    data: null,
  };
};
