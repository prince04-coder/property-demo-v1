import { api } from './api';

/**
 * Creates a new global adjustment (tax or expense).
 * @param {Object} settingData - Setting payload (type, percentage, effectiveDate)
 * @returns {Promise<Object>} Created setting
 */
export function createSetting(settingData) {
  return api.post('/api/settings', settingData);
}

/**
 * Updates an existing global adjustment.
 * @param {string} settingId - Setting ID
 * @param {Object} settingData - Fields to update
 * @returns {Promise<Object>} Updated setting
 */
export function updateSetting(settingId, settingData) {
  return api.put(`/api/settings/${settingId}`, settingData);
}
