export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'omit', // No cookies in current architecture unless required
    ...options,
  };

  const response = await fetch(url, defaultOptions);
  
  let data;
  try {
    data = await response.json();
  } catch (err) {
    data = null;
  }

  if (!response.ok) {
    throw new ApiError(response.status, data?.error || response.statusText, data);
  }

  return data;
}

export async function fetchAuthApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // Use include credentials to send the cookie
  return fetchApi<T>(endpoint, {
    ...options,
    credentials: 'include',
  });
}
