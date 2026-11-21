import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import PageMeta from "../../../components/common/PageMeta";
import { toast } from "sonner";
import { SystemNotification, NotificationType } from "../models/operations";
import { INITIAL_NOTIFICATIONS } from "../services/operationsMockData";

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<SystemNotification[]>(INITIAL_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState<"all" | "unread" | NotificationType>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNotification, setSelectedNotification] = useState<SystemNotification | null>(null);

  // Statistics
  const stats = useMemo(() => {
    const total = notifications.length;
    const unread = notifications.filter((n) => !n.is_read).length;
    const hardwareAlerts = notifications.filter((n) => n.type === "disk" || n.type === "ram").length;
    const securityAlerts = notifications.filter((n) => n.type === "security" || n.type === "alert").length;
    return { total, unread, hardwareAlerts, securityAlerts };
  }, [notifications]);

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      // Tab filter
      if (activeTab === "unread" && item.is_read) return false;
      if (activeTab !== "all" && activeTab !== "unread" && item.type !== activeTab) return false;

      // Search filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchContent = item.content.toLowerCase().includes(q);
        const matchRef = item.reference_id?.toLowerCase().includes(q);
        return matchTitle || matchContent || matchRef;
      }
      return true;
    });
  }, [notifications, activeTab, searchTerm]);

  // Handlers
  const handleToggleRead = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setNotifications((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextRead = !item.is_read;
          if (nextRead) {
            toast.success("Đã đánh dấu thông báo là đã đọc");
          }
          return {
            ...item,
            is_read: nextRead,
            read_at: nextRead ? "Vừa xong" : undefined,
            read_by: nextRead ? "System Administrator" : undefined,
          };
        }
        return item;
      })
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((item) => ({
        ...item,
        is_read: true,
        read_at: "Vừa xong",
        read_by: "System Administrator",
      }))
    );
    toast.success("Đã đánh dấu tất cả thông báo là đã đọc");
  };

  const handleDeleteNotification = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setNotifications((prev) => prev.filter((item) => item.id !== id));
    toast.info("Đã xóa thông báo khỏi danh sách");
  };

  const handleClearRead = () => {
    setNotifications((prev) => prev.filter((item) => !item.is_read));
    toast.success("Đã dọn dẹp các thông báo đã đọc");
  };

  const handleNavigateAction = (item: SystemNotification) => {
    if (!item.is_read) {
      handleToggleRead(item.id);
    }
    if (item.action_url) {
      navigate(item.action_url);
    }
  };

  const renderTypeIcon = (type: NotificationType) => {
    switch (type) {
      case "disk":
        return (
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/40 flex items-center justify-center shrink-0 shadow-2xs">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2 1.5 3 3.5 3h9c2 0 3.5-1 3.5-3V7c0-2-1.5-3-3.5-3h-9C5.5 4 4 5 4 7zM9 16h6M9 12h6" />
            </svg>
          </div>
        );
      case "ram":
        return (
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/40 flex items-center justify-center shrink-0 shadow-2xs">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        );
      case "security":
        return (
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-200/60 dark:border-purple-900/40 flex items-center justify-center shrink-0 shadow-2xs">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        );
      case "alert":
        return (
          <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 border border-orange-200/60 dark:border-orange-900/40 flex items-center justify-center shrink-0 shadow-2xs">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        );
      case "system":
      default:
        return (
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-center shrink-0 shadow-2xs">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const renderBadge = (type: NotificationType) => {
    switch (type) {
      case "disk":
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">Ổ cứng C:</span>;
      case "ram":
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">RAM tải cao</span>;
      case "security":
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">Phần mềm lạ</span>;
      case "alert":
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300">Mất kết nối</span>;
      case "system":
      default:
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">Hạ nhiệt an toàn</span>;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <PageMeta
        title="Trung tâm Thông báo & Cảnh báo | AIMS ERP"
        description="Theo dõi cảnh báo tài nguyên hạ tầng máy trạm (RAM, ổ cứng, offline, bảo mật) thời gian thực"
      />

      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <Link to="/" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
          Trang chủ
        </Link>
        <span>/</span>
        <span className="text-gray-800 dark:text-gray-200 font-medium">Trung tâm Thông báo & Cảnh báo</span>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 bg-gradient-to-r from-amber-500/10 via-brand-500/10 to-indigo-500/10 dark:from-amber-950/30 dark:via-brand-950/30 dark:to-indigo-950/30 border border-amber-200/50 dark:border-amber-800/30 rounded-2xl shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Trung tâm Thông báo & Cảnh báo
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
              Toàn quyền giám sát cảnh báo tài nguyên hạ tầng, RAM, ổ đĩa và bảo mật phần mềm dùng chung toàn hệ thống
            </p>
          </div>
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/60 shadow-2xs transition-all cursor-pointer"
          >
            <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>Đánh dấu tất cả đã đọc</span>
          </button>
          <button
            onClick={handleClearRead}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-gray-800 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/40 shadow-2xs transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Dọn dẹp đã đọc</span>
          </button>
        </div>
      </div>

      {/* KPI Statistic Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>Tổng số cảnh báo</span>
            <span className="w-2 h-2 rounded-full bg-brand-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.total}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Sự kiện ghi nhận 7 ngày qua</p>
        </div>

        <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-rose-600 dark:text-rose-400 mb-1">
            <span>Chưa đọc / Cần chú ý</span>
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          </div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
            {stats.unread}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Cần kỹ thuật viên kiểm tra</p>
        </div>

        <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-amber-600 dark:text-amber-400 mb-1">
            <span>Quá tải RAM & Ổ cứng</span>
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.hardwareAlerts}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Vượt ngưỡng 90% giới hạn</p>
        </div>

        <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-purple-600 dark:text-purple-400 mb-1">
            <span>Bảo mật & Agent</span>
            <span className="w-2 h-2 rounded-full bg-purple-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.securityAlerts}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Phần mềm lạ hoặc mất telemetry</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-2xl shadow-xs">
        {/* Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-1 md:pb-0">
          {[
            { id: "all", label: "Tất cả" },
            { id: "unread", label: `Chưa đọc (${stats.unread})` },
            { id: "disk", label: "Ổ đĩa (Disk)" },
            { id: "ram", label: "Bộ nhớ RAM" },
            { id: "security", label: "Phần mềm lạ" },
            { id: "alert", label: "Mất kết nối" },
            { id: "system", label: "Hệ thống" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? "bg-brand-600 text-white shadow-xs"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo máy trạm, sự kiện..."
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

      {/* Notifications List */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-2xl shadow-xs overflow-hidden">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Không có thông báo nào</h3>
            <p className="text-xs text-gray-500 mt-1">Hệ thống đang hoạt động ổn định, không có cảnh báo mới.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredNotifications.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedNotification(item)}
                className={`p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors cursor-pointer group ${
                  item.is_read
                    ? "hover:bg-gray-50/80 dark:hover:bg-gray-800/40"
                    : "bg-amber-50/20 dark:bg-amber-950/10 hover:bg-amber-50/40 dark:hover:bg-amber-950/20"
                }`}
              >
                {/* Left: Icon & Content */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  {renderTypeIcon(item.type)}
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm font-semibold tracking-tight ${item.is_read ? "text-gray-800 dark:text-gray-200" : "text-gray-900 dark:text-white"}`}>
                        {item.title}
                      </span>
                      {renderBadge(item.type)}
                      {!item.is_read && (
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                      {item.content}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-gray-400 pt-0.5">
                      <span>{item.created_at}</span>
                      {item.reference_id && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-gray-600 dark:text-gray-300 font-semibold bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                            {item.reference_id}
                          </span>
                        </>
                      )}
                      {item.read_by && (
                        <>
                          <span>•</span>
                          <span>Đã xem bởi: {item.read_by}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  {item.action_url && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNavigateAction(item);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 dark:bg-brand-950/60 dark:hover:bg-brand-900/80 dark:text-brand-300 border border-brand-200/60 dark:border-brand-800/40 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>Xử lý ngay</span>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  )}

                  <button
                    onClick={(e) => handleToggleRead(item.id, e)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg transition-colors cursor-pointer"
                    title={item.is_read ? "Đánh dấu chưa đọc" : "Đánh dấu đã đọc"}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>

                  <button
                    onClick={(e) => handleDeleteNotification(item.id, e)}
                    className="p-2 text-gray-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                    title="Xóa cảnh báo"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2.5">
                {renderTypeIcon(selectedNotification.type)}
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Chi tiết cảnh báo
                  </h3>
                  <span className="text-xs text-gray-400">{selectedNotification.category}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedNotification(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tiêu đề cảnh báo</label>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{selectedNotification.title}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Nội dung chi tiết</label>
                <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl text-xs text-gray-700 dark:text-gray-300 leading-relaxed mt-1">
                  {selectedNotification.content}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-xs font-semibold text-gray-500">Mã thiết bị liên quan</label>
                  <p className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400 mt-0.5">
                    {selectedNotification.reference_id || "Không xác định"}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500">Thời gian phát sinh</label>
                  <p className="text-xs text-gray-700 dark:text-gray-300 mt-0.5">{selectedNotification.created_at}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={() => setSelectedNotification(null)}
                className="px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl cursor-pointer"
              >
                Đóng
              </button>
              {selectedNotification.action_url && (
                <button
                  onClick={() => {
                    const url = selectedNotification.action_url!;
                    setSelectedNotification(null);
                    navigate(url);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Điều hướng tới xử lý
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
