/**
 * Utility functions for handling avatar images
 */

/**
 * Processes an avatar URL to ensure it's properly formatted
 * Handles data URLs, Firebase Storage URLs, and regular URLs
 *
 * @param {string} avatarUrl - The avatar URL to process
 * @param {number} size - The desired size for placeholder images
 * @returns {string} - The processed avatar URL
 */
export function processAvatarUrl(avatarUrl, size = 80) {
  if (!avatarUrl) {
    // Return placeholder if no URL provided
    return `/api/placeholder/${size}/${size}`;
  }

  // If it's a data URL, return it directly
  if (avatarUrl.startsWith('data:')) {
    return avatarUrl;
  }

  // If it's a Firebase Storage URL, ensure it has the right cache control
  if (avatarUrl.includes('firebasestorage.googleapis.com')) {
    // Add cache control to prevent stale images
    if (!avatarUrl.includes('token=')) {
      const separator = avatarUrl.includes('?') ? '&' : '?';
      return `${avatarUrl}${separator}alt=media&token=${Date.now()}`;
    }
  }

  // If it's a regular URL, return it as is
  return avatarUrl;
}

/**
 * Determines if an avatar URL is a data URL
 *
 * @param {string} avatarUrl - The avatar URL to check
 * @returns {boolean} - True if the URL is a data URL
 */
export function isDataUrl(avatarUrl) {
  return avatarUrl && avatarUrl.startsWith('data:');
}

/**
 * Gets a placeholder avatar URL
 *
 * @param {number} size - The size of the placeholder
 * @returns {string} - The placeholder URL
 */
export function getPlaceholderUrl(size = 80) {
  return `/api/placeholder/${size}/${size}`;
}
