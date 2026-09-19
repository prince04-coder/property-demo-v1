/**
 * Centralized HTTP client for all API communication.
 * Handles base URL configuration, auth header injection, and error handling.
 * @module services/api
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Makes an authenticated HTTP request.
 * @param {string} endpoint - API endpoint path (e.g., '/api/auth/login')
 * @param {RequestInit} [options={}] - Fetch options
 * @returns {Promise<any>} Parsed JSON response
 * @throws {Error} On non-OK responses with server error message
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Request failed with status ${response.status}`);
  }

  return response.json();
}

/**
 * API client with RESTful method helpers.
 * Auto-attaches JWT token and base URL to every request.
 */
export const api = {
  /**
   * @param {string} endpoint
   * @returns {Promise<any>}
   */
  get: (endpoint) => request(endpoint),

  /**
   * @param {string} endpoint
   * @param {Object} data - Request body
   * @returns {Promise<any>}
   */
  post: (endpoint, data) =>
    request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /**
   * @param {string} endpoint
   * @param {Object} data - Request body
   * @returns {Promise<any>}
   */
  put: (endpoint, data) =>
    request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  /**
   * @param {string} endpoint
   * @param {Object} [data] - Request body
   * @returns {Promise<any>}
   */
  patch: (endpoint, data) =>
    request(endpoint, {
      method: 'PATCH',
      ...(data && { body: JSON.stringify(data) }),
    }),

  /**
   * @param {string} endpoint
   * @returns {Promise<any>}
   */
  delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
};
