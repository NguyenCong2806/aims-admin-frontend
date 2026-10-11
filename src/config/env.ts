function requiredEnv(
  value: string | undefined,
  name: string
) {
  if (!value) {
    throw new Error(
      `Missing environment variable: ${name}`
    );
  }

  return value;
}

export const ENV = {
  API_URL: requiredEnv(
    import.meta.env.VITE_API_URL,
    "VITE_API_URL"
  ),
  BACKEND_TARGET: import.meta.env.VITE_BACKEND_TARGET || "https://localhost:8687",
} as const;