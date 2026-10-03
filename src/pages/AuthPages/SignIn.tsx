import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import axios from "axios";
import { toast } from "sonner";
import PageMeta from "../../components/common/PageMeta";
import { useAuth } from "../../context/AuthContext";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";

interface ApiErrorResponse {
  message?: string;
}

export default function SignIn() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");

    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      setErrorMessage("Vui lòng nhập email hoặc tên đăng nhập.");
      return;
    }
    if (!password) {
      setErrorMessage("Vui lòng nhập mật khẩu.");
      return;
    }

    try {
      setIsLoading(true);
      await login({
        username: trimmedUsername,
        password,
        rememberMe,
      });

      toast.success("Đăng nhập thành công! Đang chuyển hướng...");

      // Điều hướng về trang trước đó nếu có tham số redirect
      const rawRedirect = searchParams.get("redirect");
      const targetUrl = rawRedirect ? decodeURIComponent(rawRedirect) : "/";
      navigate(targetUrl, { replace: true });
    } catch (error: unknown) {
      if (axios.isAxiosError<ApiErrorResponse>(error)) {
        const message =
          error.response?.data?.message ??
          "Tên đăng nhập hoặc mật khẩu không chính xác.";
        setErrorMessage(message);
        toast.error(message);
      } else {
        const message =
          error instanceof Error
            ? error.message
            : "Đăng nhập không thành công. Vui lòng thử lại.";
        setErrorMessage(message);
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Quick fill tài khoản mẫu cho người dùng trải nghiệm nhanh
  const handleQuickFill = (demoUser: string, demoPass: string) => {
    setUsername(demoUser);
    setPassword(demoPass);
    setErrorMessage("");
    toast.info(`Đã điền tài khoản mẫu: ${demoUser}`);
  };

  return (
    <>
      <PageMeta
        title="Đăng nhập | AIMS Enterprise IT Asset Management"
        description="Đăng nhập hệ thống Quản lý Tài sản & Hạ tầng CNTT AIMS Enterprise"
      />

      <div className="relative min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-[#090d16] text-gray-900 dark:text-gray-100 overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
        {/* Nền Gradient Ánh sáng vòm & Lưới Chấm Dot Matrix */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:24px_24px] opacity-10 dark:opacity-20" />
        </div>

        {/* Nút chuyển Dark/Light mode ở góc phải */}
        <div className="absolute top-6 right-6 z-20">
          <ThemeTogglerTwo />
        </div>

        {/* Main Wrapper Container */}
        <div className="relative z-10 w-full max-w-5xl rounded-3xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl border border-gray-200/80 dark:border-white/10 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
          {/* ================= CỘT TRÁI: THƯƠNG HIỆU & SHOWCASE ================= */}
          <div className="hidden lg:flex lg:col-span-6 flex-col justify-between p-10 bg-gradient-to-br from-indigo-950 via-slate-900 to-gray-950 text-white relative overflow-hidden border-r border-white/5">
            {/* Lớp phủ hoa văn trang trí */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.25),transparent_50%)]" />

            {/* Header Brand */}
            <div className="relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-indigo-300">
                    AIMS Enterprise
                  </h2>
                  <p className="text-[11px] font-mono text-indigo-300 tracking-widest uppercase">
                    IT Asset & Infrastructure Platform
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Phiên bản 2.5 • Bản quyền Doanh nghiệp
                </span>
                <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight">
                  Quản lý vòng đời tài sản & giám sát máy trạm thông minh.
                </h1>
                <p className="mt-3 text-xs sm:text-sm text-gray-300 leading-relaxed">
                  Đồng bộ dữ liệu phần cứng, phân tích khấu hao chi phí, kiểm kê bản quyền phần mềm và theo dõi hiệu năng tức thời.
                </p>
              </div>
            </div>

            {/* 3 Thẻ Tính năng Kính mờ */}
            <div className="relative z-10 space-y-3 my-6">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-3.5 hover:bg-white/10 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0 text-lg">
                  🖥️
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Quản lý Thiết bị & Kho phần cứng</h4>
                  <p className="text-[11px] text-gray-400">Kiểm soát Serial, Barcode, bảo hành và phân bổ phòng ban</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-3.5 hover:bg-white/10 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 text-lg">
                  📡
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Telemetry & Giám sát Máy trạm</h4>
                  <p className="text-[11px] text-gray-400">Thu thập tự động cấu hình CPU, RAM, Windows & Office key</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-3.5 hover:bg-white/10 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0 text-lg">
                  📊
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Báo cáo & Phân tích Đa chiều</h4>
                  <p className="text-[11px] text-gray-400">7 dạng biểu đồ trực quan hóa chi phí, khấu hao và tải tài nguyên</p>
                </div>
              </div>
            </div>

            {/* Footer Left */}
            <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Máy chủ: Online (99.98% SLA)
              </span>
              <span>Bảo mật SSL 256-bit</span>
            </div>
          </div>

          {/* ================= CỘT PHẢI: FORM ĐĂNG NHẬP ================= */}
          <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-between bg-white dark:bg-gray-900/90">
            <div>
              {/* Back to Home Link */}
              <div className="flex items-center justify-between mb-8">
                <Link
                  to="/"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors group"
                >
                  <span className="group-hover:-translate-x-1 transition-transform">&larr;</span>
                  <span>Quay lại Trang chủ</span>
                </Link>

                <div className="lg:hidden flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                    A
                  </div>
                  <span className="font-bold text-sm tracking-wider uppercase">AIMS</span>
                </div>
              </div>

              {/* Header Form */}
              <div className="space-y-1.5 mb-6">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                  Đăng nhập tài khoản 👋
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Nhập thông tin xác thực để truy cập không gian quản trị AIMS
                </p>
              </div>

              {/* Security Shield Banner */}
              <div className="mb-4 p-2.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/40 flex items-center gap-2.5 text-[11px] text-emerald-800 dark:text-emerald-300">
                <span className="text-base">🛡️</span>
                <span>
                  Bảo mật cấp cao: <strong>Access Token In-Memory</strong> & <strong>Refresh Token trong HttpOnly Cookie</strong> (Chống XSS/CSRF).
                </span>
              </div>

              {/* Quick Demo Chips */}
              <div className="mb-6 p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
                <div className="text-[11px] font-semibold text-indigo-900 dark:text-indigo-200 mb-2 flex items-center gap-1.5">
                  <span>⚡</span>
                  <span>Tài khoản mẫu thử nghiệm quyền hạn:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickFill("admin", "Admin@123")}
                    className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-700/80 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white transition-all cursor-pointer shadow-2xs"
                  >
                    👑 Super Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill("hoang.it", "HoangIT@123")}
                    className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-700/80 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white transition-all cursor-pointer shadow-2xs"
                  >
                    🛠️ IT Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill("lan.hr", "LanHR@123")}
                    className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-700/80 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white transition-all cursor-pointer shadow-2xs"
                  >
                    🏢 Trưởng phòng HR
                  </button>
                </div>
              </div>

              {/* Form Thực tế */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Username / Email */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Tên đăng nhập / Email công vụ <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="admin@aims.vn"
                      disabled={isLoading}
                      className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all shadow-2xs"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Mật khẩu <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => toast.info("Vui lòng liên hệ quản trị viên IT để đặt lại mật khẩu")}
                      className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 cursor-pointer"
                    >
                      Quên mật khẩu?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      disabled={isLoading}
                      className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                      title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    >
                      {showPassword ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                    <span>⚠️</span>
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Remember Me */}
                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 cursor-pointer"
                    />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      Duy trì đăng nhập trên thiết bị này
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Đang xác thực...</span>
                    </>
                  ) : (
                    <>
                      <span>Đăng nhập vào AIMS</span>
                      <span>&rarr;</span>
                    </>
                  )}
                </button>
              </form>

              {/* Single Sign-On (SSO) Enterprise */}
              <div className="mt-6">
                <div className="relative flex items-center justify-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-800" />
                  <span className="absolute px-3 text-[11px] font-semibold text-gray-400 bg-white dark:bg-gray-900">
                    HOẶC ĐĂNG NHẬP SSO
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => toast.info("Đang chuyển hướng xác thực Microsoft Entra ID...")}
                    className="flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 21 21">
                      <path fill="#f25022" d="M1 1h9v9H1z" />
                      <path fill="#00a4ef" d="M1 11h9v9H1z" />
                      <path fill="#7fba00" d="M11 1h9v9h-9z" />
                      <path fill="#ffb900" d="M11 11h9v9h-9z" />
                    </svg>
                    <span>Microsoft 365</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toast.info("Đang chuyển hướng xác thực Google Workspace...")}
                    className="flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Google Work</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Footer */}
            <div className="mt-8 pt-4 border-t border-gray-100 dark:border-gray-800 text-center">
              <p className="text-[11px] text-gray-400">
                AIMS Enterprise Platform • Bản quyền thuộc về Bộ phận Quản trị Hạ tầng IT
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
