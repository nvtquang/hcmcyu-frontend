export type ApiError = {
  timestamp?: string;
  status?: number;
  error?: string;
  message?: string;
  path?: string;
  code?: string;
  validationErrors?: Record<string, string>;
};

export type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

export type Role =
  | 'WARD_SECRETARY'
  | 'WARD_DEPUTY_SECRETARY'
  | 'TDP_SECRETARY'
  | 'TDP_DEPUTY_SECRETARY'
  | 'MEMBER';
