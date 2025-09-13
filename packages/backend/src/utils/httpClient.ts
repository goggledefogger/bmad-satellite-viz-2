/**
 * HTTP client utility using ofetch for satellite data APIs
 * Based on Context7 MCP research for optimal Node.js HTTP client
 */

import { ofetch, FetchError } from 'ofetch';
import { ApiError } from '@shared/types/api';
import { logger } from './logger';

export interface HttpClientConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  headers?: Record<string, string>;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
  query?: Record<string, string | number | boolean>;
  timeout?: number;
  retry?: number;
  retryDelay?: number;
}

export class HttpClient {
  private client: typeof ofetch;
  private config: HttpClientConfig;

  constructor(config: HttpClientConfig) {
    this.config = config;
    this.client = ofetch.create({
      baseURL: config.baseURL,
      timeout: config.timeout,
      retry: config.retryAttempts,
      retryDelay: config.retryDelay,
      headers: {
        'User-Agent': 'Satellite-Viz-Platform/1.0',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...config.headers,
      },
      onRequest: ({ request, options }) => {
        logger.apiCall(options.method || 'GET', request.toString(), {
          headers: options.headers,
          body: options.body ? 'present' : 'none',
        });
      },
      onResponse: ({ request, response }) => {
        logger.apiResponse(
          'GET', // Method will be logged in onRequest
          request.toString(),
          response.status,
          0, // Response time would need to be calculated
          {
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
          }
        );
      },
      onRequestError: ({ request, options, error }) => {
        logger.apiError(options.method || 'GET', request.toString(), error, {
          headers: options.headers,
        });
      },
      onResponseError: ({ request, response, options }) => {
        logger.apiError(
          options.method || 'GET',
          request.toString(),
          new Error(`HTTP ${response.status}: ${response.statusText}`),
          {
            status: response.status,
            statusText: response.statusText,
            responseData: response._data,
          }
        );
      },
    });
  }

  async request<T>(url: string, options: RequestOptions = {}): Promise<T> {
    try {
      const response = await this.client<T>(url, {
        method: options.method || 'GET',
        headers: options.headers,
        body: options.body as BodyInit,
        query: options.query,
        timeout: options.timeout || this.config.timeout,
        retry: options.retry || this.config.retryAttempts,
        retryDelay: options.retryDelay || this.config.retryDelay,
      });

      return response;
    } catch (error) {
      if (error instanceof FetchError) {
        throw this.createApiError(error);
      }
      throw error;
    }
  }

  async get<T>(url: string, options: Omit<RequestOptions, 'method'> = {}): Promise<T> {
    return this.request<T>(url, { ...options, method: 'GET' });
  }

  async post<T>(url: string, body?: unknown, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(url, { ...options, method: 'POST', body });
  }

  async put<T>(url: string, body?: unknown, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(url, { ...options, method: 'PUT', body });
  }

  async delete<T>(url: string, options: Omit<RequestOptions, 'method'> = {}): Promise<T> {
    return this.request<T>(url, { ...options, method: 'DELETE' });
  }

  private createApiError(error: FetchError): ApiError {
    return {
      code: this.getErrorCode(error.status || 500),
      message: error.message || 'Unknown error occurred',
      status: error.status || 500,
      details: {
        url: error.request,
        response: error.data,
        stack: error.stack,
      },
      timestamp: new Date().toISOString(),
    };
  }

  private getErrorCode(status: number): string {
    switch (status) {
      case 400:
        return 'BAD_REQUEST';
      case 401:
        return 'UNAUTHORIZED';
      case 403:
        return 'FORBIDDEN';
      case 404:
        return 'NOT_FOUND';
      case 429:
        return 'RATE_LIMITED';
      case 500:
        return 'INTERNAL_SERVER_ERROR';
      case 502:
        return 'BAD_GATEWAY';
      case 503:
        return 'SERVICE_UNAVAILABLE';
      case 504:
        return 'GATEWAY_TIMEOUT';
      default:
        return 'UNKNOWN_ERROR';
    }
  }
}

export const createHttpClient = (config: HttpClientConfig): HttpClient => {
  return new HttpClient(config);
};
