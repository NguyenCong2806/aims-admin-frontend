import React from "react";
import { SecurityPolicyConfig } from "../../../models/SystemConfig/systemConfigModel";

interface SecurityPolicyTabProps {
  data: SecurityPolicyConfig;
  onChange: (updated: SecurityPolicyConfig) => void;
}

export const SecurityPolicyTab: React.FC<SecurityPolicyTabProps> = ({
  data,
  onChange,
}) => {
  const handleChange = <K extends keyof SecurityPolicyConfig>(
    field: K,
    value: SecurityPolicyConfig[K]
  ) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Tiêu chuẩn Mật khẩu & Khóa tài khoản */}
      <div className="bg-white dark:bg-gray-850 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-lg">
            🔐
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              Chính sách Độ phức tạp Mật khẩu & Khóa tài khoản
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Quy tắc bảo mật tài khoản người dùng theo tiêu chuẩn an toàn thông tin ISO 27001
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Độ dài mật khẩu tối thiểu
            </label>
            <input
              type="number"
              min={6}
              max={32}
              value={data.minPasswordLength}
              onChange={(e) => handleChange("minPasswordLength", Number(e.target.value))}
              className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <p className="text-[10px] text-gray-400 mt-1">Khuyên nghị: Tối thiểu 8 ký tự</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Thời hạn yêu cầu đổi mật khẩu định kỳ
            </label>
            <select
              value={data.passwordExpireDays}
              onChange={(e) => handleChange("passwordExpireDays", Number(e.target.value))}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value={0}>Không bao giờ hết hạn</option>
              <option value={30}>30 ngày</option>
              <option value={60}>60 ngày</option>
              <option value={90}>90 ngày (Khuyên dùng)</option>
              <option value={180}>180 ngày</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Số lần đăng nhập sai tối đa trước khi khóa
            </label>
            <input
              type="number"
              min={3}
              max={10}
              value={data.maxLoginAttempts}
              onChange={(e) => handleChange("maxLoginAttempts", Number(e.target.value))}
              className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <p className="text-[10px] text-gray-400 mt-1">Khóa tạm thời chống Brute Force</p>
          </div>
        </div>

        {/* Toggles độ phức tạp */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
            <span className="text-xs text-gray-700 dark:text-gray-300">
              Bắt buộc có chữ cái viết HOA (A-Z)
            </span>
            <input
              type="checkbox"
              checked={data.requireUppercase}
              onChange={(e) => handleChange("requireUppercase", e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
            <span className="text-xs text-gray-700 dark:text-gray-300">
              Bắt buộc có chữ số (0-9)
            </span>
            <input
              type="checkbox"
              checked={data.requireNumbers}
              onChange={(e) => handleChange("requireNumbers", e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
            <span className="text-xs text-gray-700 dark:text-gray-300">
              Bắt buộc ký tự đặc biệt (!@#$...)
            </span>
            <input
              type="checkbox"
              checked={data.requireSpecialChars}
              onChange={(e) => handleChange("requireSpecialChars", e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded"
            />
          </div>
        </div>
      </div>

      {/* 2. Phiên làm việc & Xác thực 2 bước (2FA) */}
      <div className="bg-white dark:bg-gray-850 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg">
            🛡️
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              Phiên Đăng nhập & Xác thực 2 bước (2FA / MFA)
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Bảo vệ quyền truy cập tài khoản thông qua Google Authenticator / Microsoft Authenticator
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Thời gian tự động đăng xuất khi không thao tác
            </label>
            <select
              value={data.sessionTimeoutMinutes}
              onChange={(e) => handleChange("sessionTimeoutMinutes", Number(e.target.value))}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value={15}>15 phút</option>
              <option value={30}>30 phút</option>
              <option value={60}>60 phút (1 giờ)</option>
              <option value={240}>240 phút (4 giờ)</option>
              <option value={480}>480 phút (8 giờ làm việc)</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
            <div>
              <span className="text-xs font-bold text-gray-900 dark:text-white">
                Bắt buộc 2FA cho nhóm Quản trị viên
              </span>
              <p className="text-[10px] text-gray-400">SuperAdmin & AssetManager</p>
            </div>
            <input
              type="checkbox"
              checked={data.require2FAForAdmins}
              onChange={(e) => handleChange("require2FAForAdmins", e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
            <div>
              <span className="text-xs font-bold text-gray-900 dark:text-white">
                Bắt buộc 2FA cho toàn bộ nhân viên
              </span>
              <p className="text-[10px] text-gray-400">Áp dụng 100% tài khoản</p>
            </div>
            <input
              type="checkbox"
              checked={data.require2FAForAllUsers}
              onChange={(e) => handleChange("require2FAForAllUsers", e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded"
            />
          </div>
        </div>
      </div>

      {/* 3. Đăng nhập một lần (Single Sign-On - SSO) */}
      <div className="bg-white dark:bg-gray-850 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
          Đăng nhập một lần (SSO & Danh bạ Doanh nghiệp)
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🌐</span>
              <div>
                <span className="text-xs font-bold text-gray-900 dark:text-white">
                  Google Workspace SSO
                </span>
                <p className="text-[11px] text-gray-400">
                  Cho phép nhân viên đăng nhập bằng tài khoản Google công ty (@aims.vn)
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={data.enableGoogleSso}
              onChange={(e) => handleChange("enableGoogleSso", e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏢</span>
              <div>
                <span className="text-xs font-bold text-gray-900 dark:text-white">
                  Microsoft Entra ID (Azure AD)
                </span>
                <p className="text-[11px] text-gray-400">
                  Đồng bộ người dùng qua Microsoft 365 / Active Directory doanh nghiệp
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={data.enableMicrosoftSso}
              onChange={(e) => handleChange("enableMicrosoftSso", e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
