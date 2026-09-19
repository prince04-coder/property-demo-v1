import { api } from './api';

/**
 * Fetches the complete organizational hierarchy with monthly financial data.
 * @returns {Promise<Object>} Hierarchy data with subordinates and properties
 */
export function fetchHierarchy() {
  return api.get('/api/users/hierarchy/per-month');
}

/**
 * Fetches all renters in the system.
 * @returns {Promise<Array>} List of renter users
 */
export function fetchRenters() {
  return api.get('/api/users/renters');
}

/**
 * Fetches all renters (lightweight list for dropdowns).
 * @returns {Promise<Array>} List of renters
 */
export function fetchAllRenters() {
  return api.get('/api/users/all-renters');
}

/**
 * Creates a new user (subordinate manager or renter).
 * @param {Object} userData - User creation payload
 * @returns {Promise<Object>} Created user
 */
export function createUser(userData) {
  return api.post('/api/users/create', userData);
}

/**
 * Updates an existing user's profile.
 * @param {string} userId - User ID
 * @param {Object} userData - Fields to update
 * @returns {Promise<Object>} Updated user
 */
export function updateUser(userId, userData) {
  return api.put(`/api/users/update/${userId}`, userData);
}

/**
 * Toggles the defaulter status of a renter.
 * @param {string} renterId - Renter user ID
 * @returns {Promise<Object>} Updated renter
 */
export function toggleDefaulter(renterId) {
  return api.patch(`/api/users/renter/${renterId}/defaulter`);
}

/**
 * Fetches a renter's payment homepage data.
 * @param {string} renterId - Renter user ID
 * @returns {Promise<Object>} Renter payment data
 */
export function fetchRenterHomepage(renterId) {
  return api.get(`/api/users/renter/homepage/${renterId}`);
}
