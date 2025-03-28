/**
 * Helper utility functions for the AgroMate Farmers Data Management System
 */

/**
 * Format date to a readable string
 * @param {Date|string} date - Date to format
 * @param {string} format - Format string (default: 'MMM dd, yyyy')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'MMM dd, yyyy') => {
  if (!date) return '';
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    }).format(dateObj);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Format currency value
 * @param {number} value - Value to format
 * @param {string} currency - Currency code (default: 'USD')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value, currency = 'USD') => {
  if (value === null || value === undefined) return '';
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(value);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return '';
  }
};

/**
 * Truncate text if it exceeds maximum length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} Truncated text with ellipsis if needed
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Calculate crop growth percentage based on planting date and expected harvest date
 * @param {Date|string} plantingDate - Date when crop was planted
 * @param {Date|string} harvestDate - Expected harvest date
 * @returns {number} Growth percentage (0-100)
 */
export const calculateCropGrowth = (plantingDate, harvestDate) => {
  if (!plantingDate || !harvestDate) return 0;
  
  const start = new Date(plantingDate).getTime();
  const end = new Date(harvestDate).getTime();
  const today = new Date().getTime();
  
  if (today >= end) return 100;
  if (today <= start) return 0;
  
  const totalDuration = end - start;
  const elapsed = today - start;
  return Math.round((elapsed / totalDuration) * 100);
};