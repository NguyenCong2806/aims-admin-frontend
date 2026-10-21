import React from "react";
import { toast } from "sonner";
import { UserAccount } from "../../../models/User/userAccount";

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAccount | null;
  tempPassword: string;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  isOpen,
  onClose,
  user,
  tempPassword,
}) => {
  if (!isOpen || !user) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(tempPassword);
    toast.success("Đã sao chép mật khẩu tạm thời vào clipboard!");
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400 mx-auto">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </div>

        <div className="text-center">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Đặt Lại Mật Khẩu Thành Công
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Mật khẩu tạm thời đã được sinh ngẫu nhiên cho tài khoản{" "}
            <strong className="text-indigo-600">@{user.username}</strong> ({user.fullName})
          </p>
        </div>

        {/* TEMP PASSWORD BOX */}
        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <code className="text-base font-mono font-bold tracking-wider text-indigo-600 dark:text-indigo-400">
            {tempPassword}
          </code>
          <button
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
          ⚠️ Vui lòng gửi mật khẩu này cho nhân viên và yêu cầu họ đổi mật khẩu mới ngay trong lần đăng nhập đầu tiên.
        </p>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="w-full py-2.5 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 rounded-xl transition"
          >
            Đã lưu & Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
