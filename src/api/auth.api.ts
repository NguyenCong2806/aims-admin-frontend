import { ENV } from "../config/env";
import { api, setAccessToken } from "../library/axios";


export interface LoginRequest {
  username: string;
  password: string;
}

export interface AccountInfo {
  id: number;
  username: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  roles: string[];
}

export interface AuthResponse {
  accessToken: string;
  accessTokenExpiresAt: string;
  user: AccountInfo;
}

export async function login(
  payload: LoginRequest
): Promise<AuthResponse> {
  const { data } =
    await api.post<AuthResponse>(
      ENV.AUTH.LOGIN,
      payload
    );

  setAccessToken(data.accessToken);

  return data;
}

export async function refreshSession(): Promise<AuthResponse> {
  const { data } =
    await api.post<AuthResponse>(
      ENV.AUTH.REFRESH
    );

  setAccessToken(data.accessToken);

  return data;
}

export async function logout(): Promise<void> {
  try {
    await api.post(ENV.AUTH.LOGOUT);
  } finally {
    setAccessToken(null);
  }
}