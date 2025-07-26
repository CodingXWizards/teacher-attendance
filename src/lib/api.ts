import {
  AuthTokens,
  LoginRequest,
  AuthResponse,
  RegisterRequest,
} from "@/types/auth";
import { User } from "@/types/user";
import * as SecureStore from "expo-secure-store";

// Base API configuration
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api/v1";

// Generic response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode?: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Error types
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public data?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Request configuration
export interface RequestConfig {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string | number | boolean>;
  timeout?: number;
  retries?: number;
}

// API client class
class ApiClient {
  private baseURL: string;
  private defaultTimeout: number = 10000; // 10 seconds
  private defaultRetries: number = 3;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  // Get authentication token
  private async getAuthToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync("token");
    } catch (error) {
      console.error("Error getting auth token:", error);
      return null;
    }
  }

  // Build URL with query parameters
  private buildURL(
    endpoint: string,
    params?: Record<string, string | number | boolean>
  ): string {
    // Ensure endpoint starts with / if it doesn't already
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

    // Construct the full URL
    let fullUrl = `${this.baseURL}${cleanEndpoint}`;

    // Add query parameters if provided
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      fullUrl += `?${searchParams.toString()}`;
    }

    return fullUrl;
  }

  // Make HTTP request with optional retry logic
  private async makeRequest<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const {
      method = "GET",
      headers = {},
      body,
      params,
      timeout = this.defaultTimeout,
      // Default: GET requests retry, others don't
      retries = method === "GET" ? this.defaultRetries : 0,
    } = config;

    const url = this.buildURL(endpoint, params);

    // Create a custom timeout solution for React Native compatibility
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    // Prepare request config
    const requestConfig: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      signal: controller.signal,
    };

    if (body && method !== "GET") {
      requestConfig.body = JSON.stringify(body);
    }

    // If retries is 0, do a single attempt
    if (!retries || retries < 1) {
      try {
        const response = await fetch(url, requestConfig);
        clearTimeout(timeoutId);

        // Handle HTTP errors
        if (!response.ok) {
          let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          let errorData: any = null;

          try {
            const errorResponse = await response.json();
            errorMessage = errorResponse.message || errorMessage;
            errorData = errorResponse.data;
          } catch {
            // If error response is not JSON, use default message
          }

          throw new ApiError(response.status, errorMessage, errorData);
        }

        // Parse response
        const contentType = response.headers.get("content-type");
        let data: T;

        if (contentType?.includes("application/json")) {
          data = await response.json();
        } else {
          data = (await response.text()) as T;
        }

        // Return the data directly (unwrap from backend response format)
        return data;
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    }

    // Retry logic for retries > 0
    let lastError: Error | null = null;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, requestConfig);
        clearTimeout(timeoutId);

        // Handle HTTP errors
        if (!response.ok) {
          let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          let errorData: any = null;

          try {
            const errorResponse = await response.json();
            errorMessage = errorResponse.message || errorMessage;
            errorData = errorResponse.data;
          } catch {
            // If error response is not JSON, use default message
          }

          throw new ApiError(response.status, errorMessage, errorData);
        }

        // Parse response
        const contentType = response.headers.get("content-type");
        let data: T;

        if (contentType?.includes("application/json")) {
          data = await response.json();
        } else {
          data = (await response.text()) as T;
        }

        // Return the data directly (unwrap from backend response format)
        return data;
      } catch (error) {
        clearTimeout(timeoutId);
        lastError = error as Error;

        // Don't retry on client errors (4xx) except 429 (rate limit)
        if (
          error instanceof ApiError &&
          error.statusCode >= 400 &&
          error.statusCode < 500 &&
          error.statusCode !== 429
        ) {
          throw error;
        }

        // Don't retry on last attempt
        if (attempt === retries) {
          break;
        }

        // Wait before retry (exponential backoff)
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    // If we get here, all retries failed
    throw lastError || new Error("Request failed after all retries");
  }

  // Generic request methods
  async get<T>(
    endpoint: string,
    config?: Omit<RequestConfig, "method" | "body">
  ): Promise<T> {
    return this.makeRequest<T>(endpoint, { ...config, method: "GET" });
  }

  async post<T>(
    endpoint: string,
    body?: any,
    config?: Omit<RequestConfig, "method">
  ): Promise<T> {
    return this.makeRequest<T>(endpoint, { ...config, method: "POST", body });
  }

  async put<T>(
    endpoint: string,
    body?: any,
    config?: Omit<RequestConfig, "method">
  ): Promise<T> {
    return this.makeRequest<T>(endpoint, { ...config, method: "PUT", body });
  }

  async patch<T>(
    endpoint: string,
    body?: any,
    config?: Omit<RequestConfig, "method">
  ): Promise<T> {
    return this.makeRequest<T>(endpoint, { ...config, method: "PATCH", body });
  }

  async delete<T>(
    endpoint: string,
    config?: Omit<RequestConfig, "method" | "body">
  ): Promise<T> {
    return this.makeRequest<T>(endpoint, { ...config, method: "DELETE" });
  }

  // Paginated request helper
  async getPaginated<T>(
    endpoint: string,
    page: number = 1,
    limit: number = 10,
    config?: Omit<RequestConfig, "method" | "body">
  ): Promise<T[]> {
    return this.makeRequest<T[]>(endpoint, {
      ...config,
      method: "GET",
      params: { page, limit },
    });
  }
}

// Create and export API client instance
export const api = new ApiClient(API_BASE_URL);

// Type-safe API hooks and utilities
export const createApiHook = <T>(endpoint: string) => {
  return {
    get: (params?: Record<string, string | number | boolean>) =>
      api.get<T>(endpoint, { params }),
    post: (body?: any) => api.post<T>(endpoint, body),
    put: (body?: any) => api.put<T>(endpoint, body),
    patch: (body?: any) => api.patch<T>(endpoint, body),
    delete: () => api.delete<T>(endpoint),
    getPaginated: (page?: number, limit?: number) =>
      api.getPaginated<T>(endpoint, page, limit),
  };
};

// Common API endpoints
export const endpoints = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    logout: "/auth/logout",
    refresh: "/auth/refresh",
    me: "/auth/me",
  },
  teachers: {
    list: "/teachers",
    create: "/teachers",
    get: (id: string | number) => `/teachers/${id}`,
    update: (id: string | number) => `/teachers/${id}`,
    delete: (id: string | number) => `/teachers/${id}`,
  },
  attendance: {
    list: "/attendance",
    create: "/attendance",
    get: (id: string | number) => `/attendance/${id}`,
    update: (id: string | number) => `/attendance/${id}`,
    delete: (id: string | number) => `/attendance/${id}`,
    byDate: (date: string) => `/attendance/date/${date}`,
    byTeacher: (teacherId: string | number) =>
      `/attendance/teacher/${teacherId}`,
  },
  reports: {
    summary: "/reports/summary",
    teacher: (teacherId: string | number) => `/reports/teacher/${teacherId}`,
    dateRange: "/reports/date-range",
  },
} as const;

// Type-safe API functions
export const authApi = {
  login: (credentials: LoginRequest) =>
    api.post<AuthResponse>(endpoints.auth.login, credentials),

  register: (userData: RegisterRequest) =>
    api.post<AuthResponse>(endpoints.auth.register, userData),

  logout: () => api.post(endpoints.auth.logout),

  refresh: () => api.post<AuthTokens>(endpoints.auth.refresh),

  me: () => api.get<User>(endpoints.auth.me),
};

export const teachersApi = {
  list: (params?: { page?: number; limit?: number; search?: string }) =>
    api.getPaginated<any>(endpoints.teachers.list, params?.page, params?.limit),

  create: (teacherData: {
    name: string;
    subject: string;
    email?: string;
    phone?: string;
  }) => api.post<any>(endpoints.teachers.create, teacherData),

  get: (id: string | number) => api.get<any>(endpoints.teachers.get(id)),

  update: (id: string | number, teacherData: Partial<any>) =>
    api.put<any>(endpoints.teachers.update(id), teacherData),

  delete: (id: string | number) => api.delete(endpoints.teachers.delete(id)),
};

export const attendanceApi = {
  list: (params?: {
    page?: number;
    limit?: number;
    date?: string;
    teacherId?: number;
  }) =>
    api.getPaginated<any>(
      endpoints.attendance.list,
      params?.page,
      params?.limit
    ),

  create: (attendanceData: {
    teacherId: number;
    date: string;
    isPresent: boolean;
  }) => api.post<any>(endpoints.attendance.create, attendanceData),

  get: (id: string | number) => api.get<any>(endpoints.attendance.get(id)),

  update: (id: string | number, attendanceData: Partial<any>) =>
    api.put<any>(endpoints.attendance.update(id), attendanceData),

  delete: (id: string | number) => api.delete(endpoints.attendance.delete(id)),

  byDate: (date: string) => api.get<any[]>(endpoints.attendance.byDate(date)),

  byTeacher: (teacherId: string | number) =>
    api.get<any[]>(endpoints.attendance.byTeacher(teacherId)),
};

export const reportsApi = {
  summary: (params?: { startDate?: string; endDate?: string }) =>
    api.get<any>(endpoints.reports.summary, { params }),

  teacher: (
    teacherId: string | number,
    params?: { startDate?: string; endDate?: string }
  ) => api.get<any>(endpoints.reports.teacher(teacherId), { params }),

  dateRange: (params: { startDate: string; endDate: string }) =>
    api.get<any>(endpoints.reports.dateRange, { params }),
};

// Utility functions
export const handleApiError = (error: unknown): string => {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred";
};

export const isApiError = (error: unknown): error is ApiError => {
  return error instanceof ApiError;
};
