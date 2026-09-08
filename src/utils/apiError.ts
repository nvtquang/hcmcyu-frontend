import axios from 'axios';
import type { ApiError } from '../types/api';

export const toApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError<ApiError>(error)) {
    return (
      error.response?.data ?? {
        status: error.response?.status,
        message: error.message,
      }
    );
  }

  if (error instanceof Error) {
    return { message: error.message };
  }

  return { message: 'Unknown error' };
};
