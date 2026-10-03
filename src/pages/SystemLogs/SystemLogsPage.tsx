import React, { useState, useMemo } from "react";
import { toast } from "sonner";
import { AimsBasePageLayout, ViewMode, TreeFilterGroup } from "../../components/aims";
import PageMeta from "../../components/common/PageMeta";
import { SystemLog } from "../../models/SystemLog/systemLog";
import { systemLogService } from "../../services/SystemLog/systemLogService";
import { INITIAL_SYSTEM_LOGS } from "../../services/SystemLog/systemLogMockData";
import { SystemLogDetailModal } from "./components/SystemLogDetailModal";
import {
  formatRelativeTime,
  getChangeSummary,
  getTableInfo,
} from "./diffHelper";

export const SystemLogsPage: React.FC = () => {
  const [logs] = useState<SystemLog[]>(INITIAL_SYSTEM_LOGS);
  const [keyword, setKeyword] = useState<string>("");
  const [selectedFilter, setSelectedFilter] = useState<string | number | null>("all");
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [inspectingLog, setInspectingLog] = useState<SystemLog | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);

  // 1. Phân loại thống kê nhanh (KPIs)
  const stats = useMemo(() => {
    const total = logs.length;
    const inserts = logs.filter((l) => l.action.toUpperCase() === "INSERT").length;
    const updates = logs.filter((l) => l.action.toUpperCase() === "UPDATE").length;
    const deletes = logs.filter((l) => l.action.toUpperCase() === "DELETE").length;
    const uniqueUsers = new Set(logs.map((l) => l.userName).filter(Boolean)).size;

    return { total, inserts, updates, deletes, uniqueUsers };
  }, [logs]);

  // 2. Cây phân cấp bộ lọc bên trái (AimsTreeFilter)
  const treeGroups: TreeFilterGroup[] = useMemo(() => {
    // Đếm theo Action
    const insertCount = logs.filter((l) => l.action.toUpperCase() === "INSERT").length;
    const updateCount = logs.filter((l) => l.action.toUpperCase() === "UPDATE").length;
    const deleteCount = logs.filter((l) => l.action.toUpperCase() === "DELETE").length;

    // Đếm theo TableName
    const tableCounts: Record<string, number> = {};
    logs.forEach((l) => {
      const t = l.tableName.toLowerCase();
      tableCounts[t] = (tableCounts[t] || 0) + 1;
    });

    return [
      {
        id: "actions",
        title: "HÀNH ĐỘNG HỆ THỐNG",
        items: [
          { id: "all", label: "Tất cả hành động", count: logs.length },
          { id: "act_INSERT", label: "Thêm mới (INSERT)", count: insertCount },
          { id: "act_UPDATE", label: "Cập nhật (UPDATE)", count: updateCount },
          { id: "act_DELETE", label: "Xóa dữ liệu (DELETE)", count: deleteCount },
        ],
      },
      {
        id: "tables",
        title: "PHÂN HỆ / BẢNG DỮ LIỆU",
        items: Object.entries(tableCounts).map(([tbl, count]) => {
          const info = getTableInfo(tbl);
          return {
            id: `tbl_${tbl}`,
            label: info.label,
            count,
          };
        }),
      },
      {
        id: "time_ranges",
        title: "KHOẢNG THỜI GIAN",
        items: [
          { id: "time_today", label: "Hôm nay", count: logs.filter((l) => {
            const diffDays = (Date.now() - new Date(l.createdAt).getTime()) / (1000 * 60 * 60 * 24);
            return diffDays <= 1;
          }).length },
          { id: "time_week", label: "7 ngày qua", count: logs.filter((l) => {
            const diffDays = (Date.now() - new Date(l.createdAt).getTime()) / (1000 * 60 * 60 * 24);
            return diffDays <= 7;
          }).length },
          { id: "time_month", label: "30 ngày qua", count: logs.filter((l) => {
            const diffDays = (Date.now() - new Date(l.createdAt).getTime()) / (1000 * 60 * 60 * 24);
            return diffDays <= 30;
          }).length },
        ],
      },
    ];
  }, [logs]);

  // 3. Lọc danh sách theo từ khóa & Tree filter
  const filteredLogs = useMemo(() => {
    return logs.filter((item) => {
      // Tìm kiếm từ khóa
      if (keyword.trim()) {
        const q = keyword.toLowerCase().trim();
        const matchAction = item.action.toLowerCase().includes(q);
        const matchTable = item.tableName.toLowerCase().includes(q);
        const matchRecord = item.recordId ? item.recordId.toLowerCase().includes(q) : false;
        const matchUser = item.userName ? item.userName.toLowerCase().includes(q) : false;
        const matchIp = item.ipAddress ? item.ipAddress.toLowerCase().includes(q) : false;
        const matchOld = item.oldData ? item.oldData.toLowerCase().includes(q) : false;
        const matchNew = item.newData ? item.newData.toLowerCase().includes(q) : false;

        if (
          !matchAction &&
          !matchTable &&
          !matchRecord &&
          !matchUser &&
          !matchIp &&
          !matchOld &&
          !matchNew
        ) {
          return false;
        }
      }

      // Lọc theo cây phân cấp
      if (selectedFilter && selectedFilter !== "all") {
        const filterStr = String(selectedFilter);

        // Lọc theo Action
        if (filterStr.startsWith("act_")) {
          const act = filterStr.replace("act_", "");
          if (item.action.toUpperCase() !== act) return false;
        }

        // Lọc theo TableName
        if (filterStr.startsWith("tbl_")) {
          const tbl = filterStr.replace("tbl_", "");
          if (item.tableName.toLowerCase() !== tbl) return false;
        }

        // Lọc theo Thời gian
        if (filterStr.startsWith("time_")) {
          const timeType = filterStr.replace("time_", "");
          const diffDays =
            (Date.now() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60 * 24);
          if (timeType === "today" && diffDays > 1) return false;
          if (timeType === "week" && diffDays > 7) return false;
          if (timeType === "month" && diffDays > 30) return false;
        }
      }

      return true;
    });
  }, [logs, keyword, selectedFilter]);

  // 4. Phân trang
  const paginatedLogs = useMemo(() => {
    const start = (pageIndex - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, pageIndex, pageSize]);

  // 5. Chọn / bỏ chọn dòng
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(paginatedLogs.map((l) => l.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // 6. Mở modal xem chi tiết
  const handleOpenDetail = (log: SystemLog) => {
    setInspectingLog(log);
    setIsDetailOpen(true);
  };

  // 7. Xuất file
  const handleExport = () => {
    const itemsToExport =
      selectedIds.size > 0
        ? logs.filter((l) => selectedIds.has(l.id))
        : filteredLogs;

    systemLogService.exportToCsv(itemsToExport);
    toast.success(`Đã xuất ${itemsToExport.length} bản ghi nhật ký ra file CSV thành công!`);
  };

  // Helper render Badge Hành động
  const renderActionBadge = (action: string) => {
    switch (action.toUpperCase()) {
      case "INSERT":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            INSERT
          </span>
        );
      case "UPDATE":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            UPDATE
          </span>
        );
      case "DELETE":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            DELETE
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
            {action}
          </span>
        );
    }
  };

  // Helper render User Avatar
  const renderUserAvatar = (userName?: string | null, userId?: number | null) => {
    const initials = userName
      ? userName.slice(0, 2).toUpperCase()
      : userId
      ? `U${userId}`
      : "SYS";

    return (
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center text-xs font-bold shadow-sm flex-shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
            {userName || `User #${userId || "Sys"}`}
          </p>
          {userId && (
            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">
              ID: {userId}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <PageMeta
        title="Nhật ký hệ thống (Audit Trail) | AIMS Enterprise"
        description="Lịch sử kiểm toán thay đổi dữ liệu bảng: INSERT, UPDATE, DELETE kèm chi tiết OldData và NewData"
      />

      <AimsBasePageLayout
        moduleName="Báo cáo & Thống kê"
        moduleIcon={
          <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        }
        moduleTabs={[
          { name: "Nhật ký hệ thống", path: "/nhat-ky-he-thong", badge: filteredLogs.length },
          { name: "Báo cáo & Phân tích", path: "/bao-cao-thong-ke" },
        ]}
        title="Nhật ký hệ thống"
        subtitle="Giám sát kiểm toán toàn diện (Audit Trail): Lịch sử thao tác thêm mới, cập nhật & xóa dữ liệu trong hệ thống"
        totalRecords={filteredLogs.length}
        pageIndex={pageIndex}
        pageSize={pageSize}
        onPageChange={setPageIndex}
        searchTerm={keyword}
        onSearchChange={(val) => {
          setKeyword(val);
          setPageIndex(1);
        }}
        onExportExcel={handleExport}
        selectedCount={selectedIds.size}
        onClearSelection={() => setSelectedIds(new Set())}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        treeGroups={treeGroups}
        selectedTreeFilter={selectedFilter}
        onSelectTreeFilter={(val) => {
          setSelectedFilter(val);
          setPageIndex(1);
        }}
      >
        {/* KPI OVERVIEW METRICS CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4">
          {/* TOTAL LOGS */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Tổng sự kiện</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
                {stats.total.toLocaleString()}
              </p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>

          {/* INSERT */}
          <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Thêm mới (INSERT)</p>
              <p className="text-xl font-bold text-emerald-800 dark:text-emerald-300 mt-0.5">
                +{stats.inserts}
              </p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-bold">
              +
            </div>
          </div>

          {/* UPDATE */}
          <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/40 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">Cập nhật (UPDATE)</p>
              <p className="text-xl font-bold text-blue-800 dark:text-blue-300 mt-0.5">
                {stats.updates}
              </p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/60 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold">
              ✎
            </div>
          </div>

          {/* DELETE */}
          <div className="p-3.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-rose-700 dark:text-rose-400">Xóa dữ liệu (DELETE)</p>
              <p className="text-xl font-bold text-rose-800 dark:text-rose-300 mt-0.5">
                {stats.deletes}
              </p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-rose-100 dark:bg-rose-900/60 flex items-center justify-center text-rose-700 dark:text-rose-300 font-bold">
              🗑
            </div>
          </div>
        </div>

        {/* 1. LIST VIEW MODE (ENTERPRISE DATA TABLE) */}
        {viewMode === "list" && (
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-850 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 dark:bg-gray-800/80 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="px-4 py-3.5 w-10">
                      <input
                        type="checkbox"
                        checked={
                          paginatedLogs.length > 0 &&
                          paginatedLogs.every((l) => selectedIds.has(l.id))
                        }
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                      />
                    </th>
                    <th className="px-4 py-3.5">Thời gian (CreatedAt)</th>
                    <th className="px-4 py-3.5">Hành động</th>
                    <th className="px-4 py-3.5">Bảng dữ liệu (TableName)</th>
                    <th className="px-4 py-3.5">Mã bản ghi (RecordId)</th>
                    <th className="px-4 py-3.5">Người thực hiện</th>
                    <th className="px-4 py-3.5">IP Client</th>
                    <th className="px-4 py-3.5">Nội dung thay đổi</th>
                    <th className="px-4 py-3.5 text-right">Chi tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {paginatedLogs.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-gray-400 dark:text-gray-500">
                        <div className="flex flex-col items-center justify-center">
                          <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="text-base font-medium">Không tìm thấy bản ghi nhật ký phù hợp</p>
                          <p className="text-xs text-gray-400 mt-1">Hãy thử xóa bộ lọc hoặc tìm kiếm từ khóa khác</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedLogs.map((log) => {
                      const isSelected = selectedIds.has(log.id);
                      const tableInfo = getTableInfo(log.tableName);
                      const changeSummary = getChangeSummary(
                        log.action,
                        log.oldData,
                        log.newData
                      );

                      return (
                        <tr
                          key={log.id}
                          className={`transition hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                            isSelected ? "bg-indigo-50/40 dark:bg-indigo-950/20" : ""
                          }`}
                        >
                          {/* CHECKBOX */}
                          <td className="px-4 py-3.5">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleSelectRow(log.id)}
                              className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                            />
                          </td>

                          {/* CREATED AT */}
                          <td className="px-4 py-3.5">
                            <div className="font-medium text-gray-900 dark:text-white text-xs">
                              {formatRelativeTime(log.createdAt)}
                            </div>
                            <div className="text-[11px] text-gray-400 dark:text-gray-500 font-mono">
                              {new Date(log.createdAt).toLocaleTimeString("vi-VN", {
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                              })}{" "}
                              - {new Date(log.createdAt).toLocaleDateString("vi-VN")}
                            </div>
                          </td>

                          {/* ACTION */}
                          <td className="px-4 py-3.5">{renderActionBadge(log.action)}</td>

                          {/* TABLE NAME */}
                          <td className="px-4 py-3.5">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${tableInfo.bg}`}
                            >
                              <span>{tableInfo.label}</span>
                            </span>
                            <div className="text-[10px] text-gray-400 dark:text-gray-500 font-mono mt-0.5">
                              {log.tableName}
                            </div>
                          </td>

                          {/* RECORD ID */}
                          <td className="px-4 py-3.5">
                            {log.recordId ? (
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(log.recordId || "");
                                  toast.success(`Đã sao chép mã bản ghi: ${log.recordId}`);
                                }}
                                className="group inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-mono text-xs transition"
                                title="Click để sao chép mã RecordId"
                              >
                                <span>{log.recordId}</span>
                                <svg className="w-3 h-3 text-gray-400 group-hover:text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              </button>
                            ) : (
                              <span className="text-gray-400 text-xs italic">(Không có)</span>
                            )}
                          </td>

                          {/* USER */}
                          <td className="px-4 py-3.5">
                            {renderUserAvatar(log.userName, log.userId)}
                          </td>

                          {/* IP ADDRESS */}
                          <td className="px-4 py-3.5">
                            {log.ipAddress ? (
                              <span className="inline-flex items-center gap-1 font-mono text-[11px] text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                                <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                </svg>
                                {log.ipAddress}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-xs italic">-</span>
                            )}
                          </td>

                          {/* CHANGE SUMMARY */}
                          <td className="px-4 py-3.5 max-w-xs truncate text-xs text-gray-600 dark:text-gray-300">
                            <span title={changeSummary}>{changeSummary}</span>
                          </td>

                          {/* ACTIONS */}
                          <td className="px-4 py-3.5 text-right">
                            <button
                              onClick={() => handleOpenDetail(log)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200/60 dark:border-indigo-800 transition"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              So sánh Diff
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. TIMELINE ACTIVITY STREAM VIEW MODE */}
        {viewMode === "kanban" && (
          <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:inset-0 before:left-3 sm:before:left-4 before:w-0.5 before:bg-gradient-to-b before:from-indigo-500 before:via-gray-300 before:to-gray-200 dark:before:via-gray-700 dark:before:to-gray-800 py-3">
            {paginatedLogs.map((log) => {
              const tableInfo = getTableInfo(log.tableName);
              const changeSummary = getChangeSummary(log.action, log.oldData, log.newData);

              let nodeColor = "bg-blue-500 ring-blue-100 dark:ring-blue-900/40";
              if (log.action === "INSERT") nodeColor = "bg-emerald-500 ring-emerald-100 dark:ring-emerald-900/40";
              if (log.action === "DELETE") nodeColor = "bg-rose-500 ring-rose-100 dark:ring-rose-900/40";

              return (
                <div key={log.id} className="relative group">
                  {/* TIMELINE NODE PIN */}
                  <div
                    className={`absolute -left-6 sm:-left-8 top-4 w-4 h-4 rounded-full ${nodeColor} ring-4 border-2 border-white dark:border-gray-900 transition-transform group-hover:scale-125`}
                  ></div>

                  {/* EVENT CARD */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2.5">
                        {renderUserAvatar(log.userName, log.userId)}
                        <span className="text-gray-400">•</span>
                        {renderActionBadge(log.action)}
                        <span className={`px-2 py-0.5 rounded text-xs font-medium border ${tableInfo.bg}`}>
                          {tableInfo.label}
                        </span>
                        {log.recordId && (
                          <code className="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-700 dark:text-gray-300">
                            #{log.recordId}
                          </code>
                        )}
                      </div>

                      <div className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{formatRelativeTime(log.createdAt)}</span>
                        <span>({new Date(log.createdAt).toLocaleTimeString("vi-VN")})</span>
                      </div>
                    </div>

                    <div className="mt-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800 text-xs text-gray-700 dark:text-gray-300 flex items-center justify-between gap-3">
                      <div>
                        <span className="font-semibold text-gray-900 dark:text-white">Tóm tắt: </span>
                        <span>{changeSummary}</span>
                      </div>
                      <button
                        onClick={() => handleOpenDetail(log)}
                        className="flex-shrink-0 px-3 py-1 rounded-lg text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                      >
                        Xem chi tiết & Diff →
                      </button>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between text-[11px] text-gray-400 dark:text-gray-500 font-mono">
                      <span>Log ID: {log.id}</span>
                      <span>Client IP: {log.ipAddress || "Internal"}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* MODAL CHI TIẾT & SO SÁNH DIFF */}
        <SystemLogDetailModal
          isOpen={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false);
            setInspectingLog(null);
          }}
          log={inspectingLog}
        />
      </AimsBasePageLayout>
    </>
  );
};

export default SystemLogsPage;
