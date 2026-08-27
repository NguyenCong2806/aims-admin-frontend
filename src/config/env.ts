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

  AUTH: {
    LOGIN: requiredEnv(
      import.meta.env.VITE_AUTH_LOGIN_PATH,
      "VITE_AUTH_LOGIN_PATH"
    ),

    REFRESH: requiredEnv(
      import.meta.env.VITE_AUTH_REFRESH_PATH,
      "VITE_AUTH_REFRESH_PATH"
    ),

    LOGOUT: requiredEnv(
      import.meta.env.VITE_AUTH_LOGOUT_PATH,
      "VITE_AUTH_LOGOUT_PATH"
    ),
  },
} as const;