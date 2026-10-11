import React, { useState, useEffect } from "react";
import { AppRole } from "../../../models/Permission/permissionModel";
import { ROLE_COLOR_PRESETS } from "../permissionHelper";
import { toast } from "sonner";

interface RoleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (roleData: Partial<AppRole>) => void;
  initialRole?: AppRole | null;
  existingRoles: AppRole[];
}

export const RoleFormModal: React.FC<RoleFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialRole,
  existingRoles,
}) => {
  const [name, setName] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [colorIndex, setColorIndex] = useState<number>(1); // Default: Indigo
  const [cloneFromRoleId, setCloneFromRoleId] = useState<string>("");

  useEffect(() => {
    if (initialRole) {
      setName(initialRole.name);
      setCode(initialRole.code);
      setDescription(initialRole.description);
      const foundIdx = ROLE_COLOR_PRESETS.findIndex((p) => p.color === initialRole.color);
      setColorIndex(foundIdx >= 0 ? foundIdx : 1);
      setCloneFromRoleId("");
    } else {
      setName("");
      setCode("");
      setDescription("");
      setColorIndex(1);
      setCloneFromRoleId("");
    }
  }, [initialRole, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Vui lòng nhập tên vai trò");
      return;
    }

    if (!code.trim()) {
      toast.error("Vui lòng nhập mã định danh vai trò (VD: IT_SUPPORT)");
      return;
    }

    const selectedPreset = ROLE_COLOR_PRESETS[colorIndex];

    let permissions: string[] = [];
    if (initialRole) {
      permissions = initialRole.permissions;
    } else if (cloneFromRoleId) {
      const sourceRole = existingRoles.find((r) => r.id === cloneFromRoleId);
      if (sourceRole) {
        permissions = [...sourceRole.permissions];
      }
    }

    onSave({
      id: initialRole?.id,
      name: name.trim(),
      code: code.trim().toUpperCase(),
      description: description.trim(),
      color: selectedPreset.color,
      badgeClass: selectedPreset.badgeClass,
      permissions,
    });

    onClose();
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!initialRole && !code) {
      // Auto-suggest code from name
      const suggestedCode = val
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]/g, "_")
        .replace(/_+/g, "_")
        .toUpperCase();
      setCode(suggestedCode);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-slate-50/50 dark:bg-gray-850/50">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {initialRole ? "Chỉnh sửa vai trò" : "Thêm mới vai trò phân quyền"}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {initialRole
                ? `Cập nhật thông tin mô tả và nhận diện cho ${initialRole.name}`
                : "Thiết lập vai trò người dùng mới và kế thừa danh mục quyền hạn"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {/* Tên vai trò */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Tên vai trò <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="VD: Quản trị mạng & An ninh, Thực tập sinh IT..."
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Mã vai trò */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Mã định danh vai trò (Role Code) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              disabled={initialRole?.isSystem}
              placeholder="VD: NETWORK_ADMIN, IT_INTERN..."
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full px-3.5 py-2 text-xs font-mono uppercase rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            />
            {initialRole?.isSystem && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
                🔒 Không thể thay đổi mã của vai trò hệ thống mặc định
              </p>
            )}
          </div>

          {/* Preset màu nhận diện */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Màu sắc & Thẻ nhận diện
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ROLE_COLOR_PRESETS.map((preset, idx) => (
                <button
                  type="button"
                  key={preset.color}
                  onClick={() => setColorIndex(idx)}
                  className={`flex items-center gap-2.5 p-2 rounded-xl border text-left transition-all ${
                    colorIndex === idx
                      ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: preset.color }}
                  />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                    {preset.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Mô tả vai trò */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Mô tả trách nhiệm & Phạm vi
            </label>
            <textarea
              rows={3}
              placeholder="VD: Chịu trách nhiệm bảo dưỡng hệ thống máy trạm và tiếp nhận ticket sửa chữa..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
            />
          </div>

          {/* Kế thừa quyền từ vai trò sẵn có (Chỉ khi tạo mới) */}
          {!initialRole && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Kế thừa quyền hạn ban đầu từ vai trò có sẵn
              </label>
              <select
                value={cloneFromRoleId}
                onChange={(e) => setCloneFromRoleId(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              >
                <option value="">-- Bắt đầu từ vai trò trống (Chưa có quyền) --</option>
                {existingRoles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.code}) - {r.permissions.length} quyền
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-gray-400 mt-1">
                Giúp bạn tiết kiệm thời gian cấu hình ma trận quyền bằng cách sao chép các quyền của vai trò tương đồng.
              </p>
            </div>
          )}

          {/* Form Actions */}
          <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200 dark:shadow-none transition-colors"
            >
              {initialRole ? "Cập nhật vai trò" : "Tạo vai trò mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
