import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router";
import { Dropdown } from "../ui/dropdown/Dropdown";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: "asset" | "alert" | "contract" | "security" | "system" | "disk" | "ram";
  link: string;
  isRead: boolean;
  priority?: "urgent" | "normal" | "info";
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-disk-1",
    type: "disk",
    title: "Cảnh báo ổ cứng sắp đầy (96%)",
    message: "Máy trạm [WS-DESIGN-03] - Ổ C: chỉ còn 3.8 GB trống / 128 GB. Cần dọn dẹp gấp để tránh treo máy.",
    timestamp: "10 phút trước",
    link: "/giam-sat-may-tram",
    isRead: false,
    priority: "urgent",
  },
  {
    id: "notif-ram-1",
    type: "ram",
    title: "Cảnh báo RAM quá tải (>90%)",
    message: "Máy chủ [SRV-APP-PROD] sử dụng 15.2 / 16 GB RAM (95%) duy trì liên tục trên 20 phút.",
    timestamp: "25 phút trước",
    link: "/giam-sat-may-tram",
    isRead: false,
    priority: "urgent",
  },
  {
    id: "notif-sec-1",
    type: "security",
    title: "Phát hiện phần mềm chưa cấp phép",
    message: "Máy trạm [WS-DEV-09] vừa cài đặt phần mềm lạ (uTorrent Client) không thuộc danh mục cho phép.",
    timestamp: "1 giờ trước",
    link: "/giam-sat-may-tram/phan-mem",
    isRead: false,
    priority: "urgent",
  },
  {
    id: "notif-agent-1",
    type: "alert",
    title: "Mất tín hiệu Agent giám sát",
    message: "Máy trạm [WS-ACCOUNT-05] không gửi tín hiệu Telemetry trong hơn 48 giờ qua.",
    timestamp: "3 giờ trước",
    link: "/giam-sat-may-tram",
    isRead: true,
    priority: "normal",
  },
  {
    id: "notif-sys-1",
    type: "system",
    title: "Tài nguyên CPU đã khôi phục ổn định",
    message: "Mức tải CPU trên máy chủ [SRV-DATABASE] đã hạ nhiệt an toàn về mức 16% (dưới ngưỡng cảnh báo).",
    timestamp: "Hôm qua",
    link: "/giam-sat-may-tram",
    isRead: true,
    priority: "normal",
  },
];

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "alert">("all");
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const navigate = useNavigate();

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    switch (activeTab) {
      case "unread":
        return notifications.filter((n) => !n.isRead);
      case "alert":
        return notifications.filter((n) => n.type === "alert" || n.priority === "urgent");
      case "all":
      default:
        return notifications;
    }
  }, [notifications, activeTab]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  // Đánh dấu tất cả là đã đọc
  const handleMarkAllAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
  };

  // Xử lý khi click vào 1 thông báo
  const handleNotificationClick = (item: NotificationItem) => {
    // Đánh dấu đã đọc
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
    );
    closeDropdown();
    if (item.link) {
      navigate(item.link);
    }
  };

  // Toggle đọc/chưa đọc từng thông báo
  const handleToggleRead = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n))
    );
  };

  // Render Icon theo loại thông báo
  const renderTypeIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "disk":
        return (
          <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-200/60 dark:border-rose-800/40">
            {/* Storage / Hard Disk Icon */}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2 1.5 3 3.5 3h9c2 0 3.5-1 3.5-3V7c0-2-1.5-3-3.5-3h-9C5.5 4 4 5 4 7zm0 5h16M7 16h.01M7 8h.01" />
            </svg>
          </div>
        );
      case "ram":
        return (
          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200/60 dark:border-amber-800/40">
            {/* RAM / Microchip Icon */}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M3 9h2m-2 6h2m14-6h2m-2 6h2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </div>
        );
      case "asset":
        return (
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200/60 dark:border-emerald-800/40">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        );
      case "alert":
        return (
          <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-200/60 dark:border-rose-800/40">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        );
      case "contract":
        return (
          <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-200/60 dark:border-purple-800/40">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        );
      case "security":
        return (
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200/60 dark:border-blue-800/40">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
        );
      case "system":
      default:
        return (
          <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 flex items-center justify-center shrink-0 border border-gray-200/60 dark:border-gray-700">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="relative">
      <button
        className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full dropdown-toggle hover:text-gray-700 h-10 w-10 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white cursor-pointer shadow-2xs"
        onClick={toggleDropdown}
        title="Thông báo hệ thống AIMS"
        aria-label="Notifications"
      >
        {/* Badge số đếm chưa đọc */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-amber-500 rounded-full shadow-xs ring-2 ring-white dark:ring-gray-900 animate-in zoom-in-75 duration-200">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute -right-12 sm:right-0 mt-2 flex w-[350px] sm:w-[390px] flex-col rounded-2xl border border-gray-200/80 bg-white p-0 shadow-2xl dark:border-gray-800 dark:bg-gray-900 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header Thông báo */}
        <div className="flex items-center justify-between p-3.5 pb-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40">
          <div className="flex items-center gap-2">
            <h5 className="text-sm font-bold text-gray-900 dark:text-gray-100">
              Thông báo hệ thống
            </h5>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                {unreadCount} mới
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-[11px] font-medium text-brand-600 dark:text-brand-400 hover:underline cursor-pointer"
            >
              Đã đọc tất cả
            </button>
          )}
        </div>

        {/* Tabs Lọc Thông Báo */}
        <div className="flex items-center gap-1 px-3 pt-2 pb-1.5 border-b border-gray-100 dark:border-gray-800 text-xs">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              activeTab === "all"
                ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white font-semibold"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            Tất cả ({notifications.length})
          </button>
          <button
            onClick={() => setActiveTab("unread")}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              activeTab === "unread"
                ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white font-semibold"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            Chưa đọc ({unreadCount})
          </button>
          <button
            onClick={() => setActiveTab("alert")}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              activeTab === "alert"
                ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white font-semibold"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            Cảnh báo
          </button>
        </div>

        {/* Danh sách Thông Báo (Scrollable) */}
        <div className="max-h-[340px] overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800/60">
          {filteredNotifications.length === 0 ? (
            <div className="py-10 flex flex-col items-center justify-center text-center px-4">
              <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 mb-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Không có thông báo nào
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Các sự kiện về bàn giao, sự cố phần cứng và hợp đồng sẽ cập nhật tại đây.
              </p>
            </div>
          ) : (
            filteredNotifications.map((item) => (
              <div
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                className={`p-3 flex items-start gap-3 transition-colors cursor-pointer group hover:bg-gray-50 dark:hover:bg-gray-800/60 ${
                  !item.isRead ? "bg-amber-50/20 dark:bg-amber-950/10" : ""
                }`}
              >
                {/* Icon phân loại */}
                {renderTypeIcon(item.type)}

                {/* Nội dung thông báo */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p
                      className={`text-xs truncate ${
                        !item.isRead
                          ? "font-bold text-gray-900 dark:text-white"
                          : "font-medium text-gray-800 dark:text-gray-200"
                      }`}
                    >
                      {item.title}
                    </p>
                    {/* Chấm tròn chưa đọc */}
                    {!item.isRead && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">
                    {item.message}
                  </p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[10px] text-gray-400 font-medium">
                      {item.timestamp}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleToggleRead(e, item.id)}
                      className="text-[10px] text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      title={item.isRead ? "Đánh dấu chưa đọc" : "Đánh dấu đã đọc"}
                    >
                      {item.isRead ? "Chưa đọc" : "Đã đọc"}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer: Liên kết đến Trung Tâm Thông Báo & Cảnh Báo */}
        <div className="p-2 border-t border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/50">
          <Link
            to="/thong-bao"
            onClick={closeDropdown}
            className="flex items-center justify-center gap-1.5 w-full py-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 hover:bg-brand-50/50 dark:hover:bg-brand-950/30 rounded-xl transition-colors cursor-pointer"
          >
            <span>Xem tất cả thông báo & cảnh báo</span>
            <span>→</span>
          </Link>
        </div>
      </Dropdown>
    </div>
  );
}
