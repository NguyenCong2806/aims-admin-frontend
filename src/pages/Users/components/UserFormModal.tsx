import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { UserAccount, UserRole, UserStatus } from "../../../models/User/userAccount";
import { USER_ROLE_META } from "../userHelper";

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: UserAccount | null;
  onSave: (data: Partial<UserAccount>) => void;
}

const ALL_ROLES: UserRole[] = [
  "SuperAdmin",
  "AssetManager",
  "ITSupport",
  "Auditor",
  "DepartmentHead",
  "Staff",
];

const DEPARTMENTS = [
  "Phòng Công nghệ & IT",
  "Phòng Hành chính - Nhân sự",
  "Phòng Kế toán & Tài chính",
  "Phòng Trí tuệ Nhân tạo (AI & Data)",
  "Phòng Kinh doanh & Tiếp thị",
  "Ban Giám đốc Điều hành",
];

export const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSave,
}) => {
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [departmentName, setDepartmentName] = useState(DEPARTMENTS[0]);
  const [positionName, setPositionName] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>(["Staff"]);
  const [status, setStatus] = useState<UserStatus>("ACTIVE");
  const [mfaEnabled, setMfaEnabled] = useState(false);

  useEffect(() => {
    if (initialData) {
      setUsername(initialData.username || "");
      setFullName(initialData.fullName || "");
      setEmail(initialData.email || "");
      setPhone(initialData.phone || "");
      setDepartmentName(initialData.departmentName || DEPARTMENTS[0]);
      setPositionName(initialData.positionName || "");
      setSelectedRoles(initialData.roles || ["Staff"]);
      setStatus(initialData.status || "ACTIVE");
      setMfaEnabled(initialData.mfaEnabled || false);
    } else {
      setUsername("");
      setFullName("");
      setEmail("");
      setPhone("");
      setDepartmentName(DEPARTMENTS[0]);
      setPositionName("");
      setSelectedRoles(["Staff"]);
      setStatus("ACTIVE");
      setMfaEnabled(false);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const toggleRole = (role: UserRole) => {
    setSelectedRoles((prev) => {
      if (prev.includes(role)) {
        if (prev.length === 1) {
          toast.warning("Người dùng phải có ít nhất 1 vai trò!");
          return prev;
        }
        return prev.filter((r) => r !== role);
      } else {
        return [...prev, role];
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !fullName.trim() || !email.trim()) {
      toast.error("Vui lòng điền đầy đủ Tên đăng nhập, Họ tên và Email!");
      return;
    }

    onSave({
      id: initialData?.id,
      username: username.trim().toLowerCase(),
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      departmentName,
      positionName: positionName.trim() || "Nhân viên",
      roles: selectedRoles,
      status,
      mfaEnabled,
      assignedAssets: initialData?.assignedAssets || [],
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-850">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              {initialData ? "Chỉnh sửa Tài khoản Người dùng" : "Thêm mới Tài khoản Người dùng"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* FORM BODY */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Tên đăng nhập (Username) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="VD: hoang.it"
                disabled={!!initialData}
                className="w-full h-10 px-3 text-sm font-mono rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-850 disabled:text-gray-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Họ và tên đầy đủ <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="VD: Nguyễn Văn Hoàng"
                className="w-full h-10 px-3 text-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Email doanh nghiệp <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hoang.it@aims.vn"
                className="w-full h-10 px-3 text-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Số điện thoại liên hệ
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="VD: 0912.345.678"
                className="w-full h-10 px-3 text-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Phòng ban trực thuộc
              </label>
              <select
                value={departmentName}
                onChange={(e) => setDepartmentName(e.target.value)}
                className="w-full h-10 px-3 text-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Chức vụ / Vị trí
              </label>
              <input
                type="text"
                value={positionName}
                onChange={(e) => setPositionName(e.target.value)}
                placeholder="VD: Chuyên viên IT..."
                className="w-full h-10 px-3 text-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          {/* ROLES SELECTION */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Phân quyền & Vai trò hệ thống (RBAC) <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ALL_ROLES.map((role) => {
                const isSelected = selectedRoles.includes(role);
                const roleMeta = USER_ROLE_META[role];
                return (
                  <label
                    key={role}
                    onClick={() => toggleRole(role)}
                    className={`flex items-start gap-2.5 p-3 rounded-xl border transition cursor-pointer select-none ${
                      isSelected
                        ? "bg-indigo-50/50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 ring-1 ring-indigo-200 dark:ring-indigo-900"
                        : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="w-4 h-4 mt-0.5 text-indigo-600 rounded border-gray-300"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-xs text-gray-900 dark:text-white">
                        <span>{roleMeta.icon}</span>
                        <span>{roleMeta.label}</span>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                        {roleMeta.description}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* STATUS & 2FA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-200 dark:border-gray-800">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Trạng thái tài khoản
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as UserStatus)}
                className="w-full h-10 px-3 text-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
              >
                <option value="ACTIVE">🟢 Đang hoạt động (Active)</option>
                <option value="LOCKED">🔴 Khóa bảo mật (Locked)</option>
                <option value="PENDING">🟡 Chờ xác nhận (Pending)</option>
                <option value="INACTIVE">⚪ Ngừng sử dụng (Inactive)</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-800 mt-5">
              <div>
                <p className="text-xs font-bold text-gray-900 dark:text-white">Bảo mật 2 yếu tố (2FA)</p>
                <p className="text-[11px] text-gray-400">Yêu cầu mã OTP qua ứng dụng Authenticator</p>
              </div>
              <input
                type="checkbox"
                checked={mfaEnabled}
                onChange={(e) => setMfaEnabled(e.target.checked)}
                className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 cursor-pointer"
              />
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 rounded-xl transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 rounded-xl transition"
            >
              {initialData ? "Lưu thông tin" : "Tạo tài khoản"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
