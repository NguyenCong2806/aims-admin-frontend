import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { UserAccount, UserRole, UserStatus } from "../../models/userAccount";
import { USER_ROLE_META, ROLE_TO_ID_MAP, ID_TO_ROLE_MAP } from "../userHelper";
import { useDepartmentSelectList } from "../../../Lookups/queries/departmentsQuery";
import { usePositionSelectList } from "../../../Lookups/queries/positionsQuery";
import Select from "../../../../components/form/Select";
import { SelectListItem } from "../../../base/IService";

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

export const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSave,
}) => {
  // Lấy dữ liệu Lookup Select-List từ API backend
  const { data: departmentSelectList, isLoading: isLoadingDepts } = useDepartmentSelectList();
  const { data: positionSelectList, isLoading: isLoadingPositions } = usePositionSelectList();

  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [departmentId, setDepartmentId] = useState<number | undefined>(undefined);
  const [departmentName, setDepartmentName] = useState<string>("");
  const [positionId, setPositionId] = useState<number | null | undefined>(undefined);
  const [positionName, setPositionName] = useState<string>("");
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>(["Staff"]);
  const [status, setStatus] = useState<UserStatus>("ACTIVE");

  useEffect(() => {
    if (initialData) {
      setUsername(initialData.username || "");
      setFullName(initialData.fullName || "");
      setEmail(initialData.email || "");
      setPhone(initialData.phoneNumber || initialData.phone || "");
      setPassword("");
      setShowPassword(false);

      // Phòng ban
      let deptId = initialData.departmentId || undefined;
      const deptNm = initialData.departmentName || "";
      if (!deptId && deptNm && departmentSelectList) {
        const found = departmentSelectList.find(
          (d: SelectListItem) => String(d.value).toLowerCase() === deptNm.toLowerCase()
        );
        if (found) deptId = Number(found.key);
      }
      setDepartmentId(deptId);
      setDepartmentName(deptNm);

      // Chức vụ
      let posId = initialData.positionId || undefined;
      const posNm = initialData.positionName || "";
      if (!posId && posNm && positionSelectList) {
        const found = positionSelectList.find(
          (p: SelectListItem) => String(p.value).toLowerCase() === posNm.toLowerCase()
        );
        if (found) posId = Number(found.key);
      }
      setPositionId(posId);
      setPositionName(posNm);

      if (initialData.roleids && initialData.roleids.length > 0) {
        const mapped = initialData.roleids
          .map((id) => ID_TO_ROLE_MAP[id])
          .filter(Boolean) as UserRole[];
        setSelectedRoles(mapped.length > 0 ? [mapped[0]] : ["Staff"]);
      } else if (initialData.roles && initialData.roles.length > 0) {
        setSelectedRoles([initialData.roles[0]]);
      } else {
        setSelectedRoles(["Staff"]);
      }

      const isAct = initialData.isActive ?? (initialData.status === "ACTIVE");
      setStatus(initialData.status || (isAct ? "ACTIVE" : "INACTIVE"));
    } else {
      setUsername("");
      setFullName("");
      setEmail("");
      setPhone("");
      setPassword("");
      setShowPassword(false);
      setDepartmentId(
        departmentSelectList && departmentSelectList.length > 0
          ? Number(departmentSelectList[0].key)
          : undefined
      );
      setDepartmentName(departmentSelectList?.[0]?.value || "");
      setPositionId(
        positionSelectList && positionSelectList.length > 0
          ? Number(positionSelectList[0].key)
          : undefined
      );
      setPositionName(positionSelectList?.[0]?.value || "");
      setSelectedRoles(["SuperAdmin"]);
      setStatus("ACTIVE");
    }
  }, [initialData, isOpen, departmentSelectList, positionSelectList]);

  if (!isOpen) return null;

  const handleGenerateRandomPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
    let gen = "";
    for (let i = 0; i < 10; i++) {
      gen += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(gen);
    setShowPassword(true);
    toast.success("Đã sinh mật khẩu ngẫu nhiên: " + gen);
  };

  const handleDepartmentChange = (val: string) => {
    const num = val ? Number(val) : undefined;
    setDepartmentId(num);
    const matched = departmentSelectList?.find((d: SelectListItem) => String(d.key) === val);
    setDepartmentName(matched ? matched.value : "");
  };

  const handlePositionChange = (val: string) => {
    const num = val ? Number(val) : null;
    setPositionId(num);
    const matched = positionSelectList?.find((p: SelectListItem) => String(p.key) === val);
    setPositionName(matched ? matched.value : "");
  };

  const toggleRole = (role: UserRole) => {
    setSelectedRoles([role]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !fullName.trim() || !email.trim()) {
      toast.error("Vui lòng điền đầy đủ Tên đăng nhập, Họ tên và Email!");
      return;
    }

    if (!initialData) {
      if (!password.trim()) {
        toast.error("Vui lòng nhập mật khẩu khởi tạo cho tài khoản mới!");
        return;
      }
      if (password.length < 6) {
        toast.error("Mật khẩu khởi tạo phải có độ dài tối thiểu 6 ký tự!");
        return;
      }
    }

    const roleids = selectedRoles.map((r) => ROLE_TO_ID_MAP[r] ?? 1);

    onSave({
      id: initialData?.id,
      username: username.trim().toLowerCase(),
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim() || null,
      phoneNumber: phone.trim() || null,
      avatarUrl: null,
      password: password.trim() || undefined,
      passwordhash: password.trim() || undefined,
      departmentId,
      departmentid: departmentId,
      departmentName: departmentName || undefined,
      positionId,
      positionid: positionId,
      positionName: positionName || undefined,
      roles: selectedRoles,
      roleids: roleids.length > 0 ? roleids : [1],
      status,
      isActive: status === "ACTIVE",
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

          {/* MẬT KHẨU KHỞI TẠO (CHỈ HIỂN THỊ KHI TẠO MỚI) */}
          {!initialData && (
            <div className="p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-950/60 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">🔑</span>
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                    Mật khẩu khởi tạo <span className="text-rose-500">*</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateRandomPassword}
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
                  placeholder="Nhập mật khẩu khởi tạo (tối thiểu 6 ký tự)..."
                  className="w-full h-10 pl-3 pr-10 text-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
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
          )}

          {/* LOOKUPS SELECT LIST: PHÒNG BAN & CHỨC VỤ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Phòng ban trực thuộc
              </label>
              <Select
                options={departmentSelectList || []}
                value={departmentId !== undefined ? String(departmentId) : ""}
                onChange={(val: string) => handleDepartmentChange(val)}
                placeholder={isLoadingDepts ? "Đang tải danh sách phòng ban..." : "-- Chọn phòng ban --"}
                disabled={isLoadingDepts}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Chức vụ / Vị trí
              </label>
              <Select
                options={positionSelectList || []}
                value={positionId !== undefined && positionId !== null ? String(positionId) : ""}
                onChange={(val: string) => handlePositionChange(val)}
                placeholder={isLoadingPositions ? "Đang tải danh sách chức vụ..." : "-- Chọn chức vụ --"}
                disabled={isLoadingPositions}
              />
            </div>
          </div>

          {/* ROLES SELECTION */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Phân quyền & Vai trò hệ thống (RBAC) <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-gray-400 dark:text-gray-500">
                (Chỉ chọn 1 quyền)
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ALL_ROLES.map((role) => {
                const isSelected = selectedRoles.includes(role);
                const roleMeta = (USER_ROLE_META as Record<string, any>)[role] || USER_ROLE_META.Staff;
                return (
                  <div
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
                      onChange={() => toggleRole(role)}
                      className="w-4 h-4 mt-0.5 text-indigo-600 rounded border-gray-300 cursor-pointer pointer-events-none"
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
                  </div>
                );
              })}
            </div>
          </div>

          {/* STATUS */}
          <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
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
