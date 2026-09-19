import { api } from './api';

/**
 * Authenticates a user with email/username and password.
 * @param {string} email - User email or username
 * @param {string} password - User password
 * @returns {Promise<{user: Object, token: string}>}
 */
export function loginUser(email, password) {
  return api.post('/api/auth/login', { email, password });
}
