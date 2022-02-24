// eslint-disable-next-line import/prefer-default-export
export const isObject = (value: unknown) =>
  typeof value === 'object' && !Array.isArray(value) && value !== null;
