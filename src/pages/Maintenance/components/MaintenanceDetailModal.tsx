import React from "react";
import { toast } from "sonner";
import { MaintenanceTask, MaintenanceStatus } from "../../../models/Maintenance/maintenancePlan";
import {
  MAINTENANCE_TYPE_META,
  MAINTENANCE_STATUS_META,
  MAINTENANCE_PRIORITY_META,
  formatVND,
  formatDateDisplay,
} from "../maintenanceHelper";

interface MaintenanceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: MaintenanceTask | null;
  onUpdateStatus: (taskId: string, status: MaintenanceStatus) => void;
  onToggleChecklist: (taskId: string, checklistId: string) => void;
  onEdit: (task: MaintenanceTask) => void;
  onDelete: (taskId: string) => void;
}

export const MaintenanceDetailModal: React.FC<MaintenanceDetailModalProps> = ({
  isOpen,
  onClose,
  task,
  onUpdateStatus,
  onToggleChecklist,
  onEdit,
  onDelete,
}) => {
  if (!isOpen || !task) return null;

  const typeMeta = MAINTENANCE_TYPE_META[task.type] || MAINTENANCE_TYPE_META.PREVENTIVE;
  const statusMeta = MAINTENANCE_STATUS_META[task.status] || MAINTENANCE_STATUS_META.SCHEDULED;
  const priorityMeta = MAINTENANCE_PRIORITY_META[task.priority] || MAINTENANCE_PRIORITY_META.MEDIUM;

  const checklist = task.checklist || [];
  const completedChecklistCount = checklist.filter((c) => c.completed).length;
  const checklistPercent = checklist.length > 0 ? Math.round((completedChecklistCount / checklist.length) * 100) : 0;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-850">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-2xl border border-indigo-100 dark:border-indigo-900 shadow-sm flex-shrink-0">
              {typeMeta.icon}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                  {task.planCode}
                </span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusMeta.badgeClass}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dotClass}`}></span>
                  {statusMeta.label}
                </span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${priorityMeta.badgeClass}`}>
                  Ưu tiên: {priorityMeta.label}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-1.5 leading-snug">
                {task.title}
              </h3>
            </div>
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

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* SECTION 1: THIẾT BỊ VÀ ĐỊA ĐIỂM */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-850 border border-gray-200/80 dark:border-gray-800">
            <div>
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Thiết bị bảo trì</span>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                {task.assetName || "Bảo dưỡng chung / Chưa gắn thiết bị"}
              </p>
              {task.assetCode && (
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-xs font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                    {task.assetCode}
                  </code>
                  {task.assetCategory && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      • {task.assetCategory}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div>
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Vị trí & Phòng ban</span>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1 flex items-center gap-1.5">
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {task.locationName || "Chưa xác định vị trí"}
              </p>
              {task.departmentName && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 pl-5">
                  Bộ phận: {task.departmentName}
                </p>
              )}
            </div>
          </div>

          {/* SECTION 2: THỜI GIAN VÀ NHÂN SỰ */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div className="p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-850">
              <span className="text-xs text-gray-400">Ngày bắt đầu</span>
              <p className="font-semibold text-gray-900 dark:text-white mt-1">
                {formatDateDisplay(task.startDate)}
              </p>
              {task.startTime && <p className="text-xs text-gray-400">{task.startTime}</p>}
            </div>

            <div className="p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-850">
              <span className="text-xs text-gray-400">Ngày kết thúc</span>
              <p className="font-semibold text-gray-900 dark:text-white mt-1">
                {formatDateDisplay(task.endDate)}
              </p>
              {task.endTime && <p className="text-xs text-gray-400">{task.endTime}</p>}
            </div>

            <div className="p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-850">
              <span className="text-xs text-gray-400">Người phụ trách</span>
              <p className="font-semibold text-gray-900 dark:text-white mt-1 truncate">
                {task.assignedTo || "Chưa phân công"}
              </p>
              <p className="text-xs text-indigo-600 dark:text-indigo-400">Kỹ thuật viên</p>
            </div>

            <div className="p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-850">
              <span className="text-xs text-gray-400">Đơn vị thực hiện</span>
              <p className="font-semibold text-gray-900 dark:text-white mt-1 truncate">
                {task.vendorName || "IT Nội bộ"}
              </p>
              <p className="text-xs text-gray-400">Nhà thầu / Đối tác</p>
            </div>
          </div>

          {/* SECTION 3: CHECKLIST TIẾN ĐỘ */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                  Checklist Hạng mục kiểm tra
                </h4>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                  {completedChecklistCount}/{checklist.length}
                </span>
              </div>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                {checklistPercent}% hoàn thành
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden mb-3">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-300 rounded-full"
                style={{ width: `${checklistPercent}%` }}
              ></div>
            </div>

            {checklist.length === 0 ? (
              <p className="text-xs text-gray-400 italic">Chưa tạo danh sách checklist cho nhiệm vụ này.</p>
            ) : (
              <div className="space-y-2">
                {checklist.map((item) => (
                  <label
                    key={item.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border transition cursor-pointer ${
                      item.completed
                        ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50"
                        : "bg-white dark:bg-gray-850 border-gray-200 dark:border-gray-800 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => onToggleChecklist(task.id, item.id)}
                      className="w-4 h-4 mt-0.5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                    />
                    <span
                      className={`text-sm select-none ${
                        item.completed
                          ? "line-through text-gray-400 dark:text-gray-500"
                          : "text-gray-800 dark:text-gray-200 font-medium"
                      }`}
                    >
                      {item.text}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 4: MÔ TẢ & CHI PHÍ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-850 space-y-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Mô tả công việc & Yêu cầu</span>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {task.description || "Không có mô tả chi tiết."}
              </p>
              {task.notes && (
                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-800 text-xs text-amber-700 dark:text-amber-400">
                  <strong>Ghi chú:</strong> {task.notes}
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-850 space-y-3">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Dự toán & Chi phí thực tế</span>
              <div className="space-y-2">
                <div className="flex justify-between text-sm py-1 border-b border-gray-200 dark:border-gray-800">
                  <span className="text-gray-500 dark:text-gray-400">Chi phí dự toán:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatVND(task.estimatedCost)}
                  </span>
                </div>
                <div className="flex justify-between text-sm py-1 border-b border-gray-200 dark:border-gray-800">
                  <span className="text-gray-500 dark:text-gray-400">Chi phí thực tế:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {task.actualCost ? formatVND(task.actualCost) : "Chưa nghiệm thu"}
                  </span>
                </div>
                {task.completionReport && (
                  <div className="pt-2 text-xs text-gray-600 dark:text-gray-300">
                    <strong>Biên bản nghiệm thu:</strong> {task.completionReport}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onDelete(task.id);
                onClose();
                toast.success("Đã xóa kế hoạch bảo trì");
              }}
              className="px-3 py-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
            >
              Xóa kế hoạch
            </button>
            <button
              onClick={() => {
                onEdit(task);
                onClose();
              }}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition"
            >
              Chỉnh sửa
            </button>
          </div>

          <div className="flex items-center gap-2">
            {task.status !== "IN_PROGRESS" && task.status !== "COMPLETED" && (
              <button
                onClick={() => {
                  onUpdateStatus(task.id, "IN_PROGRESS");
                  toast.success("Đã chuyển trạng thái sang Đang tiến hành");
                }}
                className="px-4 py-2 text-xs font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/60 dark:text-amber-300 rounded-xl transition"
              >
                Bắt đầu thực hiện
              </button>
            )}

            {task.status !== "COMPLETED" && (
              <button
                onClick={() => {
                  onUpdateStatus(task.id, "COMPLETED");
                  toast.success("Đã nghiệm thu và hoàn thành công việc bảo trì!");
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 rounded-xl transition"
              >
                ✓ Nghiệm thu Hoàn thành
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 rounded-xl transition"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
