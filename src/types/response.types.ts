/**
 * Standard API Response Model
 * Following REST API best practices
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  timestamp: string;
  path?: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: string[];
  timestamp: string;
  path?: string;
  statusCode?: number;
}

export interface PaginatedResponse<T> {
  success: true;
  message: string;
  data: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  timestamp: string;
}

/**
 * Helper functions to create standard responses
 */
export class ResponseBuilder {
  static success<T>(data: T, message = 'Success'): ApiResponse<T> {
    return {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  static error(message: string, errors?: string[], statusCode?: number): ApiErrorResponse {
    return {
      success: false,
      message,
      errors,
      statusCode,
      timestamp: new Date().toISOString(),
    };
  }

  static paginated<T>(
    data: T[],
    total: number,
    limit: number,
    offset: number,
    message = 'Success'
  ): PaginatedResponse<T> {
    return {
      success: true,
      message,
      data,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + data.length < total,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
