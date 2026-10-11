import React from "react";
import { MaintenanceTask, MaintenanceStatus } from "../../../models/Maintenance/maintenancePlan";
import {
  MAINTENANCE_TYPE_META,
  MAINTENANCE_STATUS_META,
  MAINTENANCE_PRIORITY_META,
  formatDateDisplay,
  formatVND,
} from "../maintenanceHelper";

interface MaintenanceListViewProps {
  tasks: MaintenanceTask[];
  selectedIds: Set<string>;
  onToggleSelectRow: (id: string) => void;
  onToggleSelectAll: (checked: boolean) => void;
  onSelectTask: (task: MaintenanceTask) => void;
  onUpdateStatus: (taskId: string, status: MaintenanceStatus) => void;
}

export const MaintenanceListView: React.FC<MaintenanceListViewProps> = ({
  tasks,
  selectedIds,
  onToggleSelectRow,
  onToggleSelectAll,
  onSelectTask,
  onUpdateStatus,
}) => {
  const isAllSelected = tasks.length > 0 && tasks.every((t) => selectedIds.has(t.id));

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-850 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 dark:bg-gray-800/80 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
            <tr>
              <th className="px-4 py-3.5 w-10">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={(e) => onToggleSelectAll(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                />
              </th>
              <th className="px-4 py-3.5">Mã KH & Tiêu đề công việc</th>
              <th className="px-4 py-3.5">Loại bảo trì</th>
              <th className="px-4 py-3.5">Thiết bị & Vị trí</th>
              <th className="px-4 py-3.5">Thời gian thực hiện</th>
              <th className="px-4 py-3.5">Người phụ trách</th>
              <th className="px-4 py-3.5">Độ ưu tiên</th>
              <th className="px-4 py-3.5">Trạng thái</th>
              <th className="px-4 py-3.5 text-right">Chi phí</th>
              <th className="px-4 py-3.5 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-gray-400 dark:text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-3xl mb-2">📋</span>
                    <p className="text-base font-medium">Không có kế hoạch bảo trì nào phù hợp</p>
                    <p className="text-xs text-gray-400 mt-1">Hãy thử xóa bộ lọc hoặc tìm kiếm từ khóa khác</p>
                  </div>
                </td>
              </tr>
            ) : (
              tasks.map((task) => {
                const isSelected = selectedIds.has(task.id);
                const typeMeta = MAINTENANCE_TYPE_META[task.type] || MAINTENANCE_TYPE_META.PREVENTIVE;
                const statusMeta = MAINTENANCE_STATUS_META[task.status] || MAINTENANCE_STATUS_META.SCHEDULED;
                const priorityMeta = MAINTENANCE_PRIORITY_META[task.priority] || MAINTENANCE_PRIORITY_META.MEDIUM;

                return (
                  <tr
                    key={task.id}
                    className={`transition hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                      isSelected ? "bg-indigo-50/40 dark:bg-indigo-950/20" : ""
                    }`}
                  >
                    {/* CHECKBOX */}
                    <td className="px-4 py-3.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelectRow(task.id)}
                        className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                      />
                    </td>

                    {/* CODE & TITLE */}
                    <td className="px-4 py-3.5 max-w-sm">
                      <span className="font-mono text-xs font-bold text-gray-500 dark:text-gray-400">
                        {task.planCode}
                      </span>
                      <p
                        onClick={() => onSelectTask(task)}
                        className="text-xs font-bold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer truncate mt-0.5"
                        title={task.title}
                      >
                        {task.title}
                      </p>
                    </td>

                    {/* TYPE */}
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${typeMeta.badgeClass}`}>
                        <span>{typeMeta.icon}</span>
                        <span>{typeMeta.label}</span>
                      </span>
                    </td>

                    {/* ASSET */}
                    <td className="px-4 py-3.5">
                      {task.assetCode ? (
                        <div>
                          <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                            <span>{task.assetCode}</span>
                          </div>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate max-w-[180px]">
                            {task.assetName}
                          </p>
                          <p className="text-[10px] text-gray-400 truncate max-w-[180px]">
                            📍 {task.locationName || "-"}
                          </p>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs italic">Khu vực chung</span>
                      )}
                    </td>

                    {/* SCHEDULE DATE */}
                    <td className="px-4 py-3.5">
                      <div className="text-xs font-semibold text-gray-900 dark:text-white">
                        {formatDateDisplay(task.startDate)}
                      </div>
                      {task.endDate && task.endDate !== task.startDate && (
                        <div className="text-[11px] text-gray-400">
                          đến {formatDateDisplay(task.endDate)}
                        </div>
                      )}
                      {task.startTime && (
                        <div className="text-[10px] text-gray-400 font-mono">
                          {task.startTime} - {task.endTime || "17:00"}
                        </div>
                      )}
                    </td>

                    {/* ASSIGNED */}
                    <td className="px-4 py-3.5">
                      <p className="text-xs font-medium text-gray-900 dark:text-white">
                        {task.assignedTo || "Chưa phân công"}
                      </p>
                      <p className="text-[11px] text-gray-400 truncate max-w-[140px]">
                        {task.vendorName || "IT Nội bộ"}
                      </p>
                    </td>

                    {/* PRIORITY */}
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${priorityMeta.badgeClass}`}>
                        {priorityMeta.label}
                      </span>
                    </td>

                    {/* STATUS */}
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusMeta.badgeClass}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dotClass}`}></span>
                        {statusMeta.label}
                      </span>
                    </td>

                    {/* COST */}
                    <td className="px-4 py-3.5 text-right font-mono text-xs">
                      <div className="font-bold text-gray-900 dark:text-white">
                        {formatVND(task.estimatedCost)}
                      </div>
                      {task.actualCost && (
                        <div className="text-[10px] text-emerald-600 font-semibold">
                          TT: {formatVND(task.actualCost)}
                        </div>
                      )}
                    </td>

                    {/* ACTION */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {task.status !== "COMPLETED" && (
                          <button
                            onClick={() => onUpdateStatus(task.id, "COMPLETED")}
                            className="p-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded transition"
                            title="Đánh dấu hoàn thành"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => onSelectTask(task)}
                          className="px-2.5 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 rounded-lg transition"
                        >
                          Chi tiết
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
