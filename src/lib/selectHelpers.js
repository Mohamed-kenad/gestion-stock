/**
 * Utility functions for working with Select components
 */

/**
 * Ensures a value is safe to use as a SelectItem value
 * @param {any} value - The value to check
 * @param {string} fallback - Fallback value to use if the original is empty
 * @returns {string} A non-empty string value
 */
export const ensureSelectValue = (value, fallback = 'default') => {
  if (value === undefined || value === null) return fallback;
  
  const stringValue = String(value).trim();
  return stringValue === '' ? fallback : stringValue;
};

/**
 * Filters an array to ensure all items have valid ID values for SelectItem components
 * @param {Array} items - Array of items to filter
 * @param {Function} getValueFn - Function to extract the value from each item
 * @returns {Array} Filtered array with only valid items
 */
export const filterSelectItems = (items, getValueFn = (item) => item.id) => {
  if (!Array.isArray(items)) return [];
  
  return items.filter(item => {
    if (!item) return false;
    const value = getValueFn(item);
    return value !== undefined && value !== null && String(value).trim() !== '';
  });
};

/**
 * Creates a safe value for a SelectItem component
 * @param {any} value - The value to make safe
 * @param {string} prefix - Prefix to use for the fallback value
 * @returns {string} A non-empty string value that's safe to use in a SelectItem
 */
export const createSafeSelectItemValue = (value, prefix = 'item') => {
  if (value === undefined || value === null) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  }
  
  const stringValue = String(value).trim();
  if (stringValue === '') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  }
  
  return stringValue;
};

/**
 * A wrapper for SelectItem that ensures it always has a valid value
 * @param {Object} props - The props to pass to SelectItem
 * @returns {Object} Props with a guaranteed valid value
 */
export const getSafeSelectItemProps = (props) => {
  const { value, ...otherProps } = props;
  return {
    ...otherProps,
    value: createSafeSelectItemValue(value, 'select-item')
  };
};
