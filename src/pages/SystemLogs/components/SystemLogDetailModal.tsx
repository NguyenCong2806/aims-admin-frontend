import React, { useState, useMemo } from "react";
import { toast } from "sonner";
import { SystemLog } from "../../../models/SystemLog/systemLog";
import {
  computeFieldDiffs,
  formatValueForDisplay,
  getTableInfo,
  safeParseJson,
} from "../diffHelper";

interface SystemLogDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: SystemLog | null;
}

export const SystemLogDetailModal: React.FC<SystemLogDetailModalProps> = ({
  isOpen,
  onClose,
  log,
}) => {
  const [activeTab, setActiveTab] = useState<"diff" | "raw" | "metadata">("diff");
  const [onlyChangedFields, setOnlyChangedFields] = useState<boolean>(true);

  const tableInfo = useMemo(() => {
    return log ? getTableInfo(log.tableName) : null;
  }, [log]);

  const diffItems = useMemo(() => {
    if (!log) return [];
    return computeFieldDiffs(log.oldData, log.newData, log.action);
  }, [log]);

  const filteredDiffs = useMemo(() => {
    if (!onlyChangedFields || log?.action !== "UPDATE") return diffItems;
    return diffItems.filter((d) => d.isChanged);
  }, [diffItems, onlyChangedFields, log?.action]);

  const changedCount = useMemo(() => {
    return diffItems.filter((d) => d.isChanged).length;
  }, [diffItems]);

  if (!isOpen || !log) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Đã sao chép ${label} vào clipboard!`);
  };

  const getActionBadge = (action: string) => {
    switch (action.toUpperCase()) {
      case "INSERT":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            + INSERT (Thêm mới)
          </span>
        );
      case "UPDATE":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            ✎ UPDATE (Cập nhật)
          </span>
        );
      case "DELETE":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            🗑 DELETE (Xóa dữ liệu)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
            {action}
          </span>
        );
    }
  };

  const formattedOldData = log.oldData
    ? JSON.stringify(safeParseJson(log.oldData), null, 2)
    : "null (Không có dữ liệu cũ do tạo mới)";

  const formattedNewData = log.newData
    ? JSON.stringify(safeParseJson(log.newData), null, 2)
    : "null (Dữ liệu đã bị xóa khỏi hệ thống)";

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-850">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900 shadow-sm">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Chi tiết Nhật ký Thay đổi
                </h3>
                {getActionBadge(log.action)}
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    tableInfo?.bg || ""
                  }`}
                >
                  {tableInfo?.label || log.tableName}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 flex-wrap">
                <span>Mã sự kiện:</span>
                <code className="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-700 dark:text-gray-300">
                  {log.id}
                </code>
                <span>• Bản ghi:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {log.recordId || "(Chưa có ID)"}
                </span>
                <span>• Bởi:</span>
                <span className="font-medium text-indigo-600 dark:text-indigo-400">
                  {log.userName || `User #${log.userId || "Unknown"}`}
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            title="Đóng cửa sổ"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* TAB NAVIGATION & ACTION CONTROLS */}
        <div className="px-6 py-2.5 border-b border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-900 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab("diff")}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                activeTab === "diff"
                  ? "bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-gray-200 dark:border-gray-700"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              So sánh Thay đổi (Diff)
              {log.action === "UPDATE" && (
                <span className="px-1.5 py-0.2 rounded-full text-xs bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
                  {changedCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("raw")}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                activeTab === "raw"
                  ? "bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-gray-200 dark:border-gray-700"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              Dữ liệu JSON gốc
            </button>

            <button
              onClick={() => setActiveTab("metadata")}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                activeTab === "metadata"
                  ? "bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-gray-200 dark:border-gray-700"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Kiểm toán & Client IP
            </button>
          </div>

          {activeTab === "diff" && log.action === "UPDATE" && (
            <label className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyChangedFields}
                onChange={(e) => setOnlyChangedFields(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
              />
              <span>Chỉ hiển thị các trường bị thay đổi</span>
            </label>
          )}
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* TAB 1: VISUAL DIFF */}
          {activeTab === "diff" && (
            <div>
              {log.action === "INSERT" && (
                <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3 text-emerald-800 dark:text-emerald-200 text-sm">
                  <svg className="w-5 h-5 flex-shrink-0 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <strong>Thao tác tạo mới bản ghi:</strong> Toàn bộ các trường dưới đây được khởi tạo lần đầu vào bảng{" "}
                    <code className="px-1 py-0.5 bg-emerald-100 dark:bg-emerald-900 rounded font-mono text-xs">
                      {log.tableName}
                    </code>
                    .
                  </div>
                </div>
              )}

              {log.action === "DELETE" && (
                <div className="mb-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center gap-3 text-rose-800 dark:text-rose-200 text-sm">
                  <svg className="w-5 h-5 flex-shrink-0 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <div>
                    <strong>Thao tác xóa bản ghi:</strong> Dữ liệu dưới đây là ảnh chụp (snapshot) của bản ghi ngay trước thời điểm bị xóa.
                  </div>
                </div>
              )}

              {log.action === "UPDATE" && changedCount === 0 && (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  Không phát hiện sự khác biệt giá trị giữa dữ liệu cũ và dữ liệu mới.
                </div>
              )}

              {filteredDiffs.length > 0 && (
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800/80 text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
                      <tr>
                        <th className="px-4 py-3 w-1/4">Thuộc tính (Trường)</th>
                        <th className="px-4 py-3 w-3/8 text-rose-600 dark:text-rose-400">
                          Giá trị Cũ (Trước thay đổi)
                        </th>
                        <th className="px-4 py-3 w-3/8 text-emerald-600 dark:text-emerald-400">
                          Giá trị Mới (Sau thay đổi)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {filteredDiffs.map((diff) => {
                        const isModified = diff.isChanged;
                        return (
                          <tr
                            key={diff.field}
                            className={`transition hover:bg-gray-50/50 dark:hover:bg-gray-800/40 ${
                              isModified
                                ? "bg-amber-50/20 dark:bg-amber-950/10"
                                : "opacity-80"
                            }`}
                          >
                            {/* FIELD NAME */}
                            <td className="px-4 py-3 align-top">
                              <div className="font-medium text-gray-900 dark:text-white flex items-center gap-1.5">
                                {isModified && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                )}
                                <span>{diff.fieldLabel}</span>
                              </div>
                              <code className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                                {diff.field}
                              </code>
                            </td>

                            {/* OLD VALUE */}
                            <td className="px-4 py-3 align-top font-mono text-xs">
                              {log.action === "INSERT" ? (
                                <span className="text-gray-400 italic">-- Không có --</span>
                              ) : isModified ? (
                                <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 break-words whitespace-pre-wrap">
                                  <span className="line-through opacity-85">
                                    {formatValueForDisplay(diff.oldValue)}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-gray-600 dark:text-gray-400 break-words">
                                  {formatValueForDisplay(diff.oldValue)}
                                </span>
                              )}
                            </td>

                            {/* NEW VALUE */}
                            <td className="px-4 py-3 align-top font-mono text-xs">
                              {log.action === "DELETE" ? (
                                <span className="text-rose-500 italic font-semibold">
                                  [Đã xóa hoàn toàn]
                                </span>
                              ) : isModified ? (
                                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold break-words whitespace-pre-wrap">
                                  {formatValueForDisplay(diff.newValue)}
                                </div>
                              ) : (
                                <span className="text-gray-600 dark:text-gray-400 break-words">
                                  {formatValueForDisplay(diff.newValue)}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: RAW JSON CODE VIEW */}
          {activeTab === "raw" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* OLD JSON */}
              <div className="flex flex-col rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm bg-gray-900">
                <div className="flex items-center justify-between px-4 py-2.5 bg-gray-850 border-b border-gray-800">
                  <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    OldData (Dữ liệu cũ)
                  </div>
                  {log.oldData && (
                    <button
                      onClick={() => copyToClipboard(formattedOldData, "OldData JSON")}
                      className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 transition flex items-center gap-1"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy
                    </button>
                  )}
                </div>
                <div className="p-4 flex-1 overflow-x-auto max-h-[450px]">
                  <pre className="text-xs font-mono text-gray-300 leading-relaxed whitespace-pre">
                    {formattedOldData}
                  </pre>
                </div>
              </div>

              {/* NEW JSON */}
              <div className="flex flex-col rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm bg-gray-900">
                <div className="flex items-center justify-between px-4 py-2.5 bg-gray-850 border-b border-gray-800">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    NewData (Dữ liệu mới)
                  </div>
                  {log.newData && (
                    <button
                      onClick={() => copyToClipboard(formattedNewData, "NewData JSON")}
                      className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 transition flex items-center gap-1"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy
                    </button>
                  )}
                </div>
                <div className="p-4 flex-1 overflow-x-auto max-h-[450px]">
                  <pre className="text-xs font-mono text-gray-300 leading-relaxed whitespace-pre">
                    {formattedNewData}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AUDIT METADATA */}
          {activeTab === "metadata" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-850 space-y-3">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                  Thông tin Đối tượng & Thao tác
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-1.5 border-b border-gray-200/60 dark:border-gray-800">
                    <span className="text-gray-500 dark:text-gray-400">ID Nhật ký (Guid):</span>
                    <span className="font-mono text-xs text-gray-900 dark:text-white select-all">
                      {log.id}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-gray-200/60 dark:border-gray-800">
                    <span className="text-gray-500 dark:text-gray-400">Hành động:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {log.action}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-gray-200/60 dark:border-gray-800">
                    <span className="text-gray-500 dark:text-gray-400">Bảng dữ liệu:</span>
                    <span className="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                      {log.tableName}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-gray-200/60 dark:border-gray-800">
                    <span className="text-gray-500 dark:text-gray-400">Mã bản ghi (RecordId):</span>
                    <span className="font-mono text-xs font-bold text-gray-900 dark:text-white">
                      {log.recordId || "null"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-850 space-y-3">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                  Thông tin Người dùng & Môi trường
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-1.5 border-b border-gray-200/60 dark:border-gray-800">
                    <span className="text-gray-500 dark:text-gray-400">Tên người dùng:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {log.userName || "Hệ thống tự động"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-gray-200/60 dark:border-gray-800">
                    <span className="text-gray-500 dark:text-gray-400">Mã User ID:</span>
                    <span className="font-mono text-xs text-gray-900 dark:text-white">
                      {log.userId !== undefined && log.userId !== null ? log.userId : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-gray-200/60 dark:border-gray-800">
                    <span className="text-gray-500 dark:text-gray-400">Địa chỉ IP / Client:</span>
                    <span className="inline-flex items-center gap-1 font-mono text-xs text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950 px-2 py-0.5 rounded border border-cyan-200 dark:border-cyan-800">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                      {log.ipAddress || "Không rõ IP"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-gray-200/60 dark:border-gray-800">
                    <span className="text-gray-500 dark:text-gray-400">Thời gian tạo (UTC):</span>
                    <span className="font-mono text-xs text-gray-900 dark:text-white">
                      {log.createdAt}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-gray-200/60 dark:border-gray-800">
                    <span className="text-gray-500 dark:text-gray-400">Thời gian cục bộ:</span>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {new Date(log.createdAt).toLocaleString("vi-VN", {
                        timeZone: "Asia/Ho_Chi_Minh",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Audit Trail chuẩn SOC 2 / ISO 27001 • Bản ghi bất biến
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                copyToClipboard(
                  JSON.stringify(log, null, 2),
                  "toàn bộ đối tượng Nhật ký"
                );
              }}
              className="px-4 py-2 rounded-xl text-xs font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              Sao chép JSON Sự kiện
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
