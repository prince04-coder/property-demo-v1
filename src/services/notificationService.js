import { api } from './api';

/**
 * Fetches system notifications.
 * @returns {Promise<Array>} List of notifications
 */
export function fetchNotifications() {
  return api.get('/api/notifications');
}
