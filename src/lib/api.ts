/**
 * API helper for making authenticated requests to the backend
 */

// API base URL - empty string for same-origin, or full URL for cross-origin (split deployment)
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Get full API URL (prepends base URL for split deployment)
 */
export function getApiUrl(endpoint: string): string {
  return `${API_BASE_URL}${endpoint}`;
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface ApiRequestOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
}

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

/**
 * Get the stored auth token
 */
export function getAuthToken(): string | null {
  return localStorage.getItem('adminToken');
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

/**
 * Make an authenticated API request
 */
export async function apiRequest<T = unknown>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  const { method = 'GET', body, headers = {} } = options;
  const token = getAuthToken();

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      // Handle 401 - token expired/invalid
      if (response.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminAuth');
        window.location.href = '/admin'; // Redirect to login
      }

      return {
        data: null,
        error: data?.error || `Request failed with status ${response.status}`,
        status: response.status,
      };
    }

    return { data, error: null, status: response.status };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Network error',
      status: 0,
    };
  }
}

/**
 * Make an authenticated file upload request
 */
export async function apiUpload<T = unknown>(
  endpoint: string,
  formData: FormData
): Promise<ApiResponse<T>> {
  const token = getAuthToken();

  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminAuth');
        window.location.href = '/admin';
      }

      return {
        data: null,
        error: data?.error || `Upload failed with status ${response.status}`,
        status: response.status,
      };
    }

    return { data, error: null, status: response.status };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Network error',
      status: 0,
    };
  }
}
