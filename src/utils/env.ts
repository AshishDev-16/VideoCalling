export const loadEnvConfig = (key: string): string => {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
};