import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { UserAccount } from "../../models/userAccount";

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAccount | null;
  onConfirm: (newPassword: string) => Promise<void>;
  initialPassword?: string;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  isOpen,
  onClose,
  user,
  onConfirm,
  initialPassword = "",
}) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);
  const [savedPassword, setSavedPassword] = useState("");

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
    let gen = "";
    for (let i = 0; i < 10; i++) {
      gen += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return gen;
  };

  useEffect(() => {
    if (isOpen) {
      const init = initialPassword || generateRandomPassword();
      setPassword(init);
      setShowPassword(true);
      setIsSavedSuccess(false);
      setSavedPassword("");
    }
  }, [isOpen, initialPassword]);

  if (!isOpen || !user) return null;

  const handleGenerate = () => {
    const gen = generateRandomPassword();
    setPassword(gen);
    setShowPassword(true);
    toast.success("Đã sinh mật khẩu ngẫu nhiên: " + gen);
  };

  const handleCopy = () => {
    const passToCopy = isSavedSuccess ? savedPassword : password;
    navigator.clipboard.writeText(passToCopy);
    toast.success("Đã sao chép mật khẩu vào clipboard!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      toast.error("Vui lòng nhập mật khẩu mới!");
      return;
    }
    if (password.length < 6) {
      toast.error("Mật khẩu mới phải có tối thiểu 6 ký tự!");
      return;
    }

    try {
      setIsSubmitting(true);
      await onConfirm(password.trim());
      setSavedPassword(password.trim());
      setIsSavedSuccess(true);
      toast.success(`Đổi mật khẩu thành công cho tài khoản [${user.username}]!`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Đổi mật khẩu thất bại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ICON */}
        <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </div>

        {/* TITLE */}
        <div className="text-center">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {isSavedSuccess ? "Đổi Mật Khẩu Thành Công" : "Cấp Lại / Đổi Mật Khẩu"}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Tài khoản: <strong className="text-indigo-600 dark:text-indigo-400">@{user.username}</strong> ({user.fullName})
          </p>
        </div>

        {isSavedSuccess ? (
          /* TRẠNG THÁI ĐÃ ĐỔI THÀNH CÔNG */
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <code className="text-base font-mono font-bold tracking-wider text-indigo-600 dark:text-indigo-400">
                {savedPassword}
              </code>
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition flex items-center gap-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Sao chép
              </button>
            </div>

            <p className="text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-lg border border-amber-200 dark:border-amber-900">
              ⚠️ Mật khẩu đã được cập nhật thành công vào hệ thống. Vui lòng sao chép và gửi mật khẩu này cho nhân viên để họ đăng nhập.
            </p>

            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-md shadow-indigo-600/20"
              >
                Hoàn tất & Đóng
              </button>
            </div>
          </div>
        ) : (
          /* FORM NHẬP / TỰ TẠO MẬT KHẨU MỚI */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  Mật khẩu mới <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1"
                >
                  ⚡ Tạo mật khẩu ngẫu nhiên
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)..."
                  disabled={isSubmitting}
                  className="w-full h-10 pl-3 pr-10 text-sm font-mono rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm"
                  title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-800">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 rounded-xl transition"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !password.trim()}
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 shadow-md shadow-indigo-600/20 rounded-xl transition flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Đang lưu...
                  </>
                ) : (
                  "Xác nhận đổi mật khẩu"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
