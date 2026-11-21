import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import PageMeta from "../../../components/common/PageMeta";
import { toast } from "sonner";
import { ActionableTask, TaskPriority, TaskStatus, TaskType } from "../models/operations";
import { INITIAL_ACTIONABLE_TASKS } from "../services/operationsMockData";

export default function ActionableTasksPage() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<ActionableTask[]>(INITIAL_ACTIONABLE_TASKS);
  const [statusFilter, setStatusFilter] = useState<"ALL" | TaskStatus>("PENDING");
  const [priorityFilter, setPriorityFilter] = useState<"ALL" | TaskPriority>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTask, setSelectedTask] = useState<ActionableTask | null>(null);

  // Statistics
  const stats = useMemo(() => {
    const total = tasks.length;
    const pending = tasks.filter((t) => t.status === "PENDING").length;
    const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length;
    const completed = tasks.filter((t) => t.status === "COMPLETED").length;
    const urgentCount = tasks.filter((t) => (t.priority === "URGENT" || t.priority === "HIGH") && t.status !== "COMPLETED").length;
    return { total, pending, inProgress, completed, urgentCount };
  }, [tasks]);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((item) => {
      // Status filter
      if (statusFilter !== "ALL" && item.status !== statusFilter) return false;

      // Priority filter
      if (priorityFilter !== "ALL" && item.priority !== priorityFilter) return false;

      // Search filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchCode = item.task_code.toLowerCase().includes(q);
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchDesc = item.description.toLowerCase().includes(q);
        const matchRef = item.reference_id?.toLowerCase().includes(q);
        return matchCode || matchTitle || matchDesc || matchRef;
      }
      return true;
    });
  }, [tasks, statusFilter, priorityFilter, searchTerm]);

  // Handlers
  const handleCompleteTask = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setTasks((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          toast.success(`Đã hoàn tất nhiệm vụ: ${item.task_code}`);
          return {
            ...item,
            status: "COMPLETED",
            urgencyLabel: "Xong",
            completed_at: "Vừa xong",
            completed_by: "System Administrator",
          };
        }
        return item;
      })
    );
  };

  const handleStartTask = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setTasks((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          toast.info(`Đang chuyển trạng thái nhiệm vụ: ${item.task_code} sang đang xử lý`);
          return {
            ...item,
            status: "IN_PROGRESS",
            urgencyLabel: "Đang làm",
          };
        }
        return item;
      })
    );
  };

  const handleNavigateTask = (task: ActionableTask) => {
    if (task.action_url) {
      navigate(task.action_url);
    }
  };

  const renderPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case "URGENT":
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/50">Khẩn cấp</span>;
      case "HIGH":
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border border-orange-200/50">Ưu tiên cao</span>;
      case "MEDIUM":
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/50">Trung bình</span>;
      case "LOW":
      default:
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200/50">Thấp</span>;
    }
  };

  const renderStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case "COMPLETED":
        return <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">Đã hoàn thành</span>;
      case "IN_PROGRESS":
        return <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">Đang can thiệp</span>;
      case "CANCELLED":
        return <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">Đã hủy</span>;
      case "PENDING":
      default:
        return <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">Chờ xử lý</span>;
    }
  };

  const renderTypeIcon = (type: TaskType) => {
    switch (type) {
      case "RESOURCE_OVERLOAD":
        return (
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/40 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        );
      case "UNAUTHORIZED_APP":
        return (
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-200/60 dark:border-purple-900/40 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        );
      case "LICENSE_EXPIRY":
        return (
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/40 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        );
      case "AGENT_OFFLINE":
      default:
        return (
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/40 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <PageMeta
        title="Công việc cần xử lý | AIMS ERP"
        description="Quản lý và giải quyết các đầu việc can thiệp hạ tầng, giải phóng tài nguyên và xử lý vi phạm license"
      />

      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <Link to="/" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
          Trang chủ
        </Link>
        <span>/</span>
        <span className="text-gray-800 dark:text-gray-200 font-medium">Nhiệm vụ & Công việc cần xử lý</span>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 bg-gradient-to-r from-rose-500/10 via-brand-500/10 to-indigo-500/10 dark:from-rose-950/30 dark:via-brand-950/30 dark:to-indigo-950/30 border border-rose-200/50 dark:border-rose-800/30 rounded-2xl shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-500/20 shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Công việc cần xử lý (Actionable Tasks)
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
              Danh sách nhiệm vụ vận hành hạ tầng, giải phóng dung lượng máy trạm và xử lý gia hạn bản quyền
            </p>
          </div>
        </div>

        {/* Global Action */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            onClick={() => toast.success("Dữ liệu nhiệm vụ đã được đồng bộ mới nhất")}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/60 shadow-2xs transition-all cursor-pointer"
          >
            <svg className="w-4 h-4 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Làm mới danh sách</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-rose-600 dark:text-rose-400 mb-1">
            <span>Chờ can thiệp (Pending)</span>
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          </div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
            {stats.pending}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Cần kỹ thuật viên giải quyết</p>
        </div>

        <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-orange-600 dark:text-orange-400 mb-1">
            <span>Việc khẩn cấp / Hạn gấp</span>
            <span className="w-2 h-2 rounded-full bg-orange-500" />
          </div>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {stats.urgentCount}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Ưu tiên xử lý trong ngày</p>
        </div>

        <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-blue-600 dark:text-blue-400 mb-1">
            <span>Đang thực hiện</span>
            <span className="w-2 h-2 rounded-full bg-blue-500" />
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {stats.inProgress}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Đang được IT can thiệp</p>
        </div>

        <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 mb-1">
            <span>Đã hoàn thành</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {stats.completed}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Nhiệm vụ đóng thành công</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-2xl shadow-xs">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-1 md:pb-0">
          {[
            { id: "PENDING", label: `Chờ xử lý (${stats.pending})` },
            { id: "IN_PROGRESS", label: `Đang làm (${stats.inProgress})` },
            { id: "COMPLETED", label: `Đã xong (${stats.completed})` },
            { id: "ALL", label: `Tất cả (${stats.total})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-brand-600 text-white shadow-xs"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Priority Filter & Search Input */}
        <div className="flex items-center gap-2">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as any)}
            className="px-2.5 py-1.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/40"
          >
            <option value="ALL">Mọi mức độ</option>
            <option value="URGENT">Khẩn cấp</option>
            <option value="HIGH">Ưu tiên cao</option>
            <option value="MEDIUM">Trung bình</option>
            <option value="LOW">Thấp</option>
          </select>

          <div className="relative w-full md:w-64">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo mã task, máy trạm..."
              className="w-full pl-9 pr-8 py-1.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tasks Table / Card List */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-2xl shadow-xs overflow-hidden">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Không có công việc nào</h3>
            <p className="text-xs text-gray-500 mt-1">Toàn bộ các nhiệm vụ đã được xử lý hoặc không có đầu việc phù hợp với bộ lọc.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredTasks.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedTask(item)}
                className={`p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors cursor-pointer group ${
                  item.status === "COMPLETED"
                    ? "opacity-60 bg-gray-50/40 dark:bg-gray-800/20"
                    : "hover:bg-gray-50/80 dark:hover:bg-gray-800/40"
                }`}
              >
                {/* Left: Icon & Task Details */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  {renderTypeIcon(item.task_type)}
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-2 py-0.5 rounded-md border border-brand-200/50">
                        {item.task_code}
                      </span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">
                        {item.title}
                      </span>
                      {renderPriorityBadge(item.priority)}
                      {renderStatusBadge(item.status)}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                      {item.description}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-gray-400 pt-0.5">
                      <span className="text-rose-600 dark:text-rose-400 font-semibold">
                        Hạn chót: {item.due_date}
                      </span>
                      {item.reference_id && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-gray-600 dark:text-gray-300 font-semibold bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                            {item.reference_id}
                          </span>
                        </>
                      )}
                      {item.completed_by && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-600 font-medium">Hoàn tất bởi: {item.completed_by}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  {item.status !== "COMPLETED" && (
                    <>
                      {item.status === "PENDING" && (
                        <button
                          onClick={(e) => handleStartTask(item.id, e)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 transition-colors cursor-pointer"
                        >
                          Bắt đầu làm
                        </button>
                      )}

                      <button
                        onClick={(e) => handleCompleteTask(item.id, e)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 transition-colors flex items-center gap-1 cursor-pointer"
                        title="Đánh dấu đã hoàn thành"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Hoàn thành</span>
                      </button>
                    </>
                  )}

                  {item.action_url && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNavigateTask(item);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 dark:bg-brand-950/60 dark:hover:bg-brand-900/80 dark:text-brand-300 border border-brand-200/60 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>Xử lý ngay</span>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2.5">
                {renderTypeIcon(selectedTask.task_type)}
                <div>
                  <span className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400">
                    {selectedTask.task_code}
                  </span>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Chi tiết công việc
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tiêu đề nhiệm vụ</label>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{selectedTask.title}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Mô tả chi tiết</label>
                <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl text-xs text-gray-700 dark:text-gray-300 leading-relaxed mt-1">
                  {selectedTask.description}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-xs font-semibold text-gray-500">Mức độ ưu tiên</label>
                  <div className="mt-1">{renderPriorityBadge(selectedTask.priority)}</div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500">Trạng thái xử lý</label>
                  <div className="mt-1">{renderStatusBadge(selectedTask.status)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-xs font-semibold text-gray-500">Thiết bị liên quan</label>
                  <p className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400 mt-0.5">
                    {selectedTask.reference_id || "Chung toàn hệ thống"}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500">Hạn chót xử lý</label>
                  <p className="text-xs text-rose-600 font-semibold mt-0.5">{selectedTask.due_date}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={() => setSelectedTask(null)}
                className="px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl cursor-pointer"
              >
                Đóng
              </button>

              {selectedTask.status !== "COMPLETED" && (
                <button
                  onClick={() => {
                    handleCompleteTask(selectedTask.id);
                    setSelectedTask(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Xác nhận hoàn thành
                </button>
              )}

              {selectedTask.action_url && (
                <button
                  onClick={() => {
                    const url = selectedTask.action_url;
                    setSelectedTask(null);
                    navigate(url);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Mở trang xử lý
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
