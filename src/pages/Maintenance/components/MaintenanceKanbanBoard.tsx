import React from "react";
import { MaintenanceTask, MaintenanceStatus } from "../../../models/Maintenance/maintenancePlan";
import {
  MAINTENANCE_TYPE_META,
  MAINTENANCE_STATUS_META,
  MAINTENANCE_PRIORITY_META,
  formatDateDisplay,
  formatVND,
} from "../maintenanceHelper";

interface MaintenanceKanbanBoardProps {
  tasks: MaintenanceTask[];
  onSelectTask: (task: MaintenanceTask) => void;
  onUpdateStatus: (taskId: string, status: MaintenanceStatus) => void;
  onAddNew: () => void;
}

const COLUMNS: Array<{ status: MaintenanceStatus; title: string }> = [
  { status: "SCHEDULED", title: "Chờ thực hiện" },
  { status: "IN_PROGRESS", title: "Đang tiến hành" },
  { status: "COMPLETED", title: "Đã hoàn thành" },
  { status: "OVERDUE", title: "Quá hạn xử lý" },
];

export const MaintenanceKanbanBoard: React.FC<MaintenanceKanbanBoardProps> = ({
  tasks,
  onSelectTask,
  onUpdateStatus,
  onAddNew,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.status);
        const statusMeta = MAINTENANCE_STATUS_META[col.status];

        return (
          <div
            key={col.status}
            className={`rounded-2xl border border-gray-200 dark:border-gray-800 p-3.5 flex flex-col min-h-[550px] shadow-sm ${statusMeta.columnBg} bg-white/70 dark:bg-gray-850/80 backdrop-blur-xs`}
          >
            {/* COLUMN HEADER */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-200/80 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${statusMeta.dotClass}`}></span>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  {col.title}
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 shadow-2xs">
                {colTasks.length}
              </span>
            </div>

            {/* COLUMN CARDS */}
            <div className="flex-1 mt-3 space-y-3 overflow-y-auto">
              {colTasks.length === 0 ? (
                <div className="h-32 flex flex-col items-center justify-center text-xs text-gray-400 dark:text-gray-500 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
                  <span>Không có công việc nào</span>
                </div>
              ) : (
                colTasks.map((task) => {
                  const typeMeta = MAINTENANCE_TYPE_META[task.type] || MAINTENANCE_TYPE_META.PREVENTIVE;
                  const priorityMeta = MAINTENANCE_PRIORITY_META[task.priority] || MAINTENANCE_PRIORITY_META.MEDIUM;

                  const checklist = task.checklist || [];
                  const completedChecklist = checklist.filter((c) => c.completed).length;

                  return (
                    <div
                      key={task.id}
                      onClick={() => onSelectTask(task)}
                      className="group p-3.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 hover:border-indigo-400 dark:hover:border-indigo-600 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between gap-2.5"
                    >
                      {/* CARD TOP META */}
                      <div className="flex items-center justify-between gap-1 flex-wrap">
                        <span className="text-[11px] font-mono font-bold text-gray-500 dark:text-gray-400">
                          {task.planCode}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${priorityMeta.badgeClass}`}>
                            {priorityMeta.label}
                          </span>
                        </div>
                      </div>

                      {/* TITLE */}
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white line-clamp-2 leading-relaxed group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                        {typeMeta.icon} {task.title}
                      </h4>

                      {/* ASSET BADGE */}
                      {task.assetCode && (
                        <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800 text-[11px] text-gray-600 dark:text-gray-300">
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                              {task.assetCode}
                            </span>
                            <span className="text-gray-400 truncate max-w-[120px]">
                              {task.locationName || ""}
                            </span>
                          </div>
                          <p className="truncate text-gray-700 dark:text-gray-300 font-medium mt-0.5">
                            {task.assetName}
                          </p>
                        </div>
                      )}

                      {/* CHECKLIST & PROGRESS */}
                      {checklist.length > 0 && (
                        <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
                          <span>Checklist:</span>
                          <span className="font-semibold text-gray-700 dark:text-gray-300">
                            {completedChecklist}/{checklist.length}
                          </span>
                        </div>
                      )}

                      {/* CARD FOOTER */}
                      <div className="pt-2 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          📅 {formatDateDisplay(task.startDate)}
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {formatVND(task.estimatedCost)}
                        </span>
                      </div>

                      {/* QUICK STATUS ACTIONS */}
                      <div className="pt-1 flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {task.status === "SCHEDULED" && (
                          <button
                            onClick={() => onUpdateStatus(task.id, "IN_PROGRESS")}
                            className="px-2 py-1 text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 rounded border border-amber-200 transition"
                          >
                            Bắt đầu làm →
                          </button>
                        )}
                        {task.status === "IN_PROGRESS" && (
                          <button
                            onClick={() => onUpdateStatus(task.id, "COMPLETED")}
                            className="px-2 py-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 rounded border border-emerald-200 transition"
                          >
                            ✓ Hoàn thành
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* QUICK ADD BUTTON */}
            {col.status === "SCHEDULED" && (
              <button
                onClick={onAddNew}
                className="mt-3 py-2 px-3 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-400 dark:hover:border-indigo-600 transition flex items-center justify-center gap-1.5"
              >
                + Thêm kế hoạch
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};
