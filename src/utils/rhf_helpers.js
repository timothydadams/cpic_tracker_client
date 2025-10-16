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
