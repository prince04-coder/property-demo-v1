import { api } from './api';

/**
 * Creates a new property under a manager.
 * @param {Object} propertyData - Property creation payload
 * @returns {Promise<Object>} Created property
 */
export function createProperty(propertyData) {
  return api.post('/api/properties/create', propertyData);
}

/**
 * Assigns a renter to a property.
 * @param {Object} assignmentData - Assignment payload (propertyId, renterId, leaseStart, leaseEnd, annualIncrement)
 * @returns {Promise<Object>} Assignment result
 */
export function assignRenter(assignmentData) {
  return api.post('/api/properties/assign-renter', assignmentData);
}

/**
 * Updates the base rent for a property.
 * @param {Object} rentData - Rent update payload
 * @returns {Promise<Object>} Update result
 */
export function updateRent(rentData) {
  return api.post('/api/properties/update-rent', rentData);
}

/**
 * Fetches the complete rent history timeline for a property.
 * @param {string} propertyId - Property ID
 * @returns {Promise<Object>} Property history with rent records
 */
export function fetchPropertyHistory(propertyId) {
  return api.get(`/api/properties/history/${propertyId}`);
}
