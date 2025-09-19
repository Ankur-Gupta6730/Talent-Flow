/**
 * Centralized API utilities with improved error handling
 * Inspired by TalentFlow repository patterns
 */

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Enhanced fetch wrapper with better error handling and retry logic
 */
export async function apiRequest<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    // Try to parse JSON response
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      // If JSON parsing fails, check content type and throw appropriate error
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new ApiError(
          'Service is not ready or returned invalid format',
          response.status,
          'INVALID_RESPONSE_FORMAT'
        );
      }
      throw new ApiError(
        'Failed to parse response as JSON',
        response.status,
        'JSON_PARSE_ERROR'
      );
    }

    if (!response.ok) {
      throw new ApiError(
        data.message || data.error || `Request failed with status ${response.status}`,
        response.status,
        data.code || 'REQUEST_FAILED'
      );
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    if ((error as any).name === 'AbortError') {
      throw new ApiError('Request timeout', 408, 'TIMEOUT');
    }
    
    // Network or other errors
    throw new ApiError(
      (error as any).message || 'Network error occurred',
      0,
      'NETWORK_ERROR'
    );
  }
}

/**
 * Retry wrapper for API requests
 */
export async function apiRequestWithRetry<T = any>(
  url: string,
  options: RequestInit = {},
  maxRetries: number = 3,
  retryDelay: number = 1000
): Promise<T> {
  let lastError: ApiError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiRequest<T>(url, options);
    } catch (error) {
      lastError = error instanceof ApiError ? error : new ApiError((error as any).message);
      
      // Don't retry on client errors (4xx) except timeout
      if (lastError.status && lastError.status >= 400 && lastError.status < 500 && lastError.code !== 'TIMEOUT') {
        throw lastError;
      }
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
    }
  }

  throw lastError!;
}

/**
 * Build query string from parameters
 */
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        searchParams.set(key, value.join(','));
      } else {
        searchParams.set(key, String(value));
      }
    }
  });
  
  return searchParams.toString();
}