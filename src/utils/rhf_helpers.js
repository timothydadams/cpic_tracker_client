import DOMPurify from 'dompurify';

export function getDirtyValues(dirtyFields, values) {
  const dirtyValues = Object.keys(dirtyFields).reduce((prev, key) => {
    const value = dirtyFields[key];
    if (!value) {
      return prev;
    }
    const isObject = typeof value === 'object';
    const isArray = Array.isArray(value);
    const nestedValue =
      isObject && !isArray ? getDirtyValues(value, values[key]) : values[key];
    return { ...prev, [key]: isArray ? values[key] : nestedValue };
  }, {});
  return dirtyValues;
}

export const recursivelySanitizeObject = (dirtyObj) => {
  const cleanObj = Array.isArray(dirtyObj) ? [] : {};

  for (const key in dirtyObj) {
    if (Object.prototype.hasOwnProperty.call(dirtyObj, key)) {
      const value = dirtyObj[key];

      if (value && typeof value === 'object') {
        // Recursively sanitize nested objects or arrays
        cleanObj[key] = recursivelySanitizeObject(value);
      } else if (typeof value === 'string') {
        // Sanitize string values using DOMPurify
        cleanObj[key] = DOMPurify.sanitize(value);
      } else {
        // Copy other types (numbers, booleans, etc.) as they are
        cleanObj[key] = value;
      }
    }
  }
  return cleanObj;
};
