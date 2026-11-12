// Hỗ trợ nạp cấu hình động tại runtime (nếu có window.__ENV__) hoặc build-time từ Vite .env
const runtimeEnv =
  typeof window !== "undefined"
    ? (window as unknown as { __ENV__?: Record<string, string> }).__ENV__
    : undefined;

const rawApiUrl = (runtimeEnv?.VITE_API_URL || import.meta.env.VITE_API_URL || "").trim();
const rawBackendTarget = (
  runtimeEnv?.VITE_BACKEND_TARGET ||
  import.meta.env.VITE_BACKEND_TARGET ||
  ""
).trim();

/**
 * Tự động phân giải URL API cho cả 2 môi trường:
 * 1. Nếu VITE_API_URL là URL tuyệt đối (bắt đầu bằng http:// hoặc https://) -> Dùng trực tiếp.
 * 2. Nếu ở môi trường Production (sau khi build npm run build):
 *    - Nếu VITE_API_URL là đường dẫn tương đối (ví dụ: "/api/v1") và có VITE_BACKEND_TARGET (URL tuyệt đối)
 *      -> Tự động ghép BACKEND_TARGET + API_URL (ví dụ: https://beasset.devlabit.info.vn/api/v1)
 *      giúp bản build tĩnh gọi thẳng tới backend mà không cần proxy của dev-server.
 * 3. Nếu ở môi trường Development (npm run dev):
 *    - Giữ nguyên đường dẫn tương đối (ví dụ: "/api/v1") để đi qua Vite dev proxy, tránh lỗi CORS khi dev localhost.
 */
function resolveApiUrl(): string {
  // Nếu là URL tuyệt đối -> sử dụng ngay
  if (/^https?:\/\//i.test(rawApiUrl)) {
    return rawApiUrl.replace(/\/+$/, "");
  }

  // Nếu đang ở Production, tự động nối backend target nếu apiUrl là relative
  const isExplicitRelative = import.meta.env.VITE_USE_RELATIVE_URL === "true";
  if (import.meta.env.PROD && !isExplicitRelative && /^https?:\/\//i.test(rawBackendTarget)) {
    const cleanTarget = rawBackendTarget.replace(/\/+$/, "");
    const cleanPath = (rawApiUrl || "/api/v1").startsWith("/")
      ? (rawApiUrl || "/api/v1")
      : `/${rawApiUrl}`;
    return `${cleanTarget}${cleanPath}`;
  }

  // Mặc định (dev hoặc relative proxy)
  return rawApiUrl || "/api/v1";
}

export const ENV = {
  API_URL: resolveApiUrl(),
  BACKEND_TARGET: rawBackendTarget || "https://beasset.devlabit.info.vn",
  IS_PROD: import.meta.env.PROD,
  IS_DEV: import.meta.env.DEV,
} as const;
