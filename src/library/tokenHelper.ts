import type { AuthUser } from "../types/auth";

export const STORAGE_KEYS = {
  ACCESS_TOKEN: "aims_access_token",
  EXPIRES_AT: "aims_access_token_expires_at",
  USER: "aims_user",
  SESSION_HINT: "aims_has_session",
  DEMO_SESSION: "aims_demo_session",
} as const;

/**
 * Trích xuất thời điểm hết hạn (ms) từ claim `exp` trong payload JWT
 */
export function parseJwtExp(token: string): number | null {
  try {
    const parts = token.split(".");
    if (parts.length === 3) {
      let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      while (base64.length % 4) {
        base64 += "=";
      }
      const json = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      const parsed = JSON.parse(json);
      if (typeof parsed.exp === "number") {
        return parsed.exp * 1000; // Đổi giây sang milliseconds
      }
    }
  } catch {
    // Không phải JWT chuẩn hoặc không decode được
  }
  return null;
}

/**
 * Lấy chuỗi ISO 8601 thời điểm hết hạn của Token
 */
export function getTokenExpiresAtIso(token: string | null, expiresAtIso?: string | null): string | null {
  if (expiresAtIso && expiresAtIso.trim() !== "") {
    return expiresAtIso;
  }
  if (!token) return null;
  const expMs = parseJwtExp(token);
  return expMs ? new Date(expMs).toISOString() : null;
}

/**
 * Kiểm tra xem AccessToken có tồn tại và còn hạn sử dụng hay không
 * @param token Chuỗi AccessToken
 * @param expiresAtIso Chuỗi ISO 8601 thời gian hết hạn (nếu có từ API)
 */
export function isTokenValid(token: string | null, expiresAtIso?: string | null): boolean {
  if (!token || token.trim() === "") return false;

  // 1. Kiểm tra từ expiresAtIso nếu có
  if (expiresAtIso && expiresAtIso.trim() !== "") {
    try {
      const expTime = new Date(expiresAtIso).getTime();
      if (!isNaN(expTime)) {
        return Date.now() < expTime;
      }
    } catch {
      // Fallback
    }
  }

  // 2. Kiểm tra từ claim exp của JWT
  const jwtExp = parseJwtExp(token);
  if (jwtExp !== null) {
    return Date.now() < jwtExp;
  }

  // 3. Fallback đọc từ localStorage nếu token khớp
  if (typeof window !== "undefined") {
    const storedExp = localStorage.getItem(STORAGE_KEYS.EXPIRES_AT);
    if (storedExp) {
      try {
        const expTime = new Date(storedExp).getTime();
        if (!isNaN(expTime)) {
          return Date.now() < expTime;
        }
      } catch {
        // Ignore
      }
    }
  }

  // Không có thông tin hạn -> Coi như hết hạn để đảm bảo an toàn
  return false;
}

/**
 * Đọc AccessToken từ localStorage
 */
export function getStoredAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) || null;
}

/**
 * Đọc thời điểm hết hạn AccessToken từ localStorage
 */
export function getStoredTokenExpiresAt(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEYS.EXPIRES_AT) || null;
}

/**
 * Đọc thông tin User từ localStorage
 */
export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const str = localStorage.getItem(STORAGE_KEYS.USER);
    return str ? JSON.parse(str) : null;
  } catch {
    return null;
  }
}

/**
 * Lưu toàn bộ phiên xác thực hợp lệ vào localStorage
 */
export function saveAuthSession(
  token: string,
  expiresAtIso?: string | null,
  user?: AuthUser | null
): void {
  if (typeof window === "undefined") return;

  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  localStorage.setItem(STORAGE_KEYS.SESSION_HINT, "true");

  const resolvedExp = getTokenExpiresAtIso(token, expiresAtIso);
  if (resolvedExp) {
    localStorage.setItem(STORAGE_KEYS.EXPIRES_AT, resolvedExp);
  } else {
    localStorage.removeItem(STORAGE_KEYS.EXPIRES_AT);
  }

  if (user) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }
}

/**
 * Xóa sạch toàn bộ phiên xác thực khỏi localStorage và sessionStorage
 */
export function clearAuthSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.EXPIRES_AT);
  localStorage.removeItem(STORAGE_KEYS.USER);
  localStorage.removeItem(STORAGE_KEYS.SESSION_HINT);
  sessionStorage.removeItem(STORAGE_KEYS.DEMO_SESSION);
}
