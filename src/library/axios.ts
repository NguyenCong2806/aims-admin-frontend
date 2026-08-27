import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";

import { ENV } from "../config/env";

let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

export const api = axios.create({
  baseURL: ENV.API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization =
      `Bearer ${accessToken}`;
  }

  return config;
});

type RetryConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

let refreshPromise: Promise<string> | null = null;

api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest =
      error.config as RetryConfig | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    if (
      originalRequest.url === ENV.AUTH.REFRESH
    ) {
      setAccessToken(null);

      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = api
          .post(ENV.AUTH.REFRESH)
          .then(({ data }) => {
            setAccessToken(data.accessToken);

            return data.accessToken;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      const newAccessToken =
        await refreshPromise;

      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      setAccessToken(null);

      return Promise.reject(refreshError);
    }
  }
);