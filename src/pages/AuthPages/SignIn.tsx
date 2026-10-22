import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import axios from "axios";
import { toast } from "sonner";
import PageMeta from "../../components/common/PageMeta";
import { useAuth } from "../../context/AuthContext";

interface ApiErrorResponse {
  message?: string;
  errorMessage?: string;
  title?: string;
  errorCode?: number;
  isError?: boolean;
  isSuccess?: boolean;
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
      const res = await login({
        username: trimmedUsername,
        password,
        rememberMe,
      });

      // Kiểm tra bảo vệ bổ sung: Nếu isSuccess là false thì hiển thị lỗi và không cho vào
      if (
        !res ||
        res.isSuccess === false ||
        res.isError === true ||
        !res.accessToken ||
        res.accessToken.trim() === ""
      ) {
        const message = res?.errorMessage || "The username or password does not exist.";
        setErrorMessage(message);
        toast.error(message);
        return;
      }

      toast.success("Đăng nhập thành công! Đang chuyển hướng...");

      // Điều hướng về trang trước đó nếu có tham số redirect
      const rawRedirect = searchParams.get("redirect");
      const targetUrl = rawRedirect ? decodeURIComponent(rawRedirect) : "/";
      navigate(targetUrl, { replace: true });
    } catch (error: unknown) {
      let message = "Đăng nhập không thành công. Vui lòng thử lại.";

      if (axios.isAxiosError<ApiErrorResponse>(error)) {
        const data = error.response?.data;
        message =
          data?.errorMessage ||
          data?.message ||
          data?.title ||
          (error.response?.status === 401
            ? "The username or password does not exist."
            : "Tên đăng nhập hoặc mật khẩu không chính xác.");
      } else if (error && typeof error === "object") {
        const errObj = error as {
          message?: string;
          response?: { data?: ApiErrorResponse };
        };
        message =
          errObj.response?.data?.errorMessage ||
          errObj.response?.data?.message ||
          errObj.message ||
          message;
      } else if (error instanceof Error) {
        message = error.message;
      }

      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <>
      <PageMeta
        title="Đăng nhập | AIMS Enterprise IT Asset Management"
        description="Đăng nhập hệ thống Quản lý Tài sản & Hạ tầng CNTT AIMS Enterprise"
      />

      <div className="relative min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-[#090d16] text-gray-900 dark:text-gray-100 overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
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
                  Phiên bản 1.0 • Bản quyền Doanh nghiệp
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

            </div>
          </div>

          {/* ================= CỘT PHẢI: FORM ĐĂNG NHẬP ================= */}
          <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-between bg-white dark:bg-gray-900/90">
            <div>
              {/* Back to Home Link */}
              <div className="flex items-center justify-between mb-8">
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
              {/* Form Thực tế */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Username / Email */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Tên đăng nhập<span className="text-rose-500">*</span>
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
                    </>
                  )}
                </button>
              </form>
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
