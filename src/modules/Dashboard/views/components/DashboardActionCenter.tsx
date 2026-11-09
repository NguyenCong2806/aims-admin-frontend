import React, { useState } from "react";
import { useNavigate } from "react-router";

export interface ActionItem {
  id: string;
  title: string;
  subtitle: string;
  count: number;
  unit: string;
  badgeText: string;
  badgeType: "urgent" | "warning" | "info" | "purple";
  icon: string;
  path: string;
  actionLabel: string;
}

export const DashboardActionCenter: React.FC = () => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const actionItems: ActionItem[] = [
    {
      id: "maintenance",
      title: "Đến hạn bảo trì kỹ thuật",
      subtitle: "Máy chủ, laptop & thiết bị mạng cần kiểm tra, vệ sinh và thay keo tản nhiệt",
      count: 12,
      unit: "tài sản",
      badgeText: "Hôm nay",
      badgeType: "urgent",
      icon: "🛠️",
      path: "/lich-bao-tri",
      actionLabel: "Xử lý bảo trì",
    },
    {
      id: "license",
      title: "Bản quyền & Giấy phép hết hạn",
      subtitle: "Chứng chỉ SSL, tên miền, tài khoản cloud AWS/Azure & key bản quyền phần mềm",
      count: 8,
      unit: "giấy phép",
      badgeText: "Gấp (30 ngày)",
      badgeType: "warning",
      icon: "📜",
      path: "/tai-nguyen-so",
      actionLabel: "Gia hạn dịch vụ",
    },
    {
      id: "workstation",
      title: "Yêu cầu cấp phát máy trạm",
      subtitle: "Telemetry AIMS Agent thu thập mới cần gán mã tài sản hoặc bàn giao nhân sự",
      count: 12,
      unit: "máy trạm",
      badgeText: "Đang chờ",
      badgeType: "info",
      icon: "💻",
      path: "/giam-sat-may-tram",
      actionLabel: "Kiểm tra máy trạm",
    },
    {
      id: "messages",
      title: "Tin nhắn & Yêu cầu nội bộ",
      subtitle: "Biên bản bàn giao từ phòng Kho và yêu cầu cấp thêm bản quyền Adobe Photoshop",
      count: 7,
      unit: "tin mới",
      badgeText: "Mới nhận",
      badgeType: "purple",
      icon: "💬",
      path: "/thiet-bi-phan-cung",
      actionLabel: "Xem trao đổi",
    },
  ];

  return (
    <div className="mb-8 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200/80 dark:border-gray-700/80 shadow-xs overflow-hidden transition-all duration-200">
      {/* Widget Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-700/70 bg-gradient-to-r from-gray-50/50 via-white/50 to-indigo-50/20 dark:from-gray-800/50 dark:via-gray-800/30 dark:to-indigo-950/20">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white shadow-md shadow-rose-500/20 text-lg">
            <span>⏰</span>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
                Công việc & Cảnh báo cần xử lý
              </h2>
              <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/60">
                32 việc tồn đọng
              </span>
              <span className="hidden sm:inline-flex px-2 py-0.5 text-[11px] font-semibold rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                7 tin nhắn
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Trung tâm điều phối các sự kiện bảo dưỡng, gia hạn tài nguyên và cấp phát tài sản CNTT trong ngày
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/lich-bao-tri")}
            className="hidden md:inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/40 rounded-lg transition-colors cursor-pointer"
          >
            <span>📅 Lịch bảo trì</span>
          </button>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-gray-100/70 dark:bg-gray-700/60 hover:bg-gray-200/70 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
            title={isCollapsed ? "Mở rộng khối" : "Thu gọn khối"}
          >
            <span>{isCollapsed ? "Mở rộng" : "Thu gọn"}</span>
            <svg
              className={`w-3.5 h-3.5 transform transition-transform ${isCollapsed ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Widget Cards Grid */}
      {!isCollapsed && (
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-200">
          {actionItems.map((item) => {
            const badgeClasses = {
              urgent: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900/40",
              warning: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900/40",
              info: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-900/40",
              purple: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-900/40",
            }[item.badgeType];

            const cardBorderHighlight = {
              urgent: "hover:border-red-400 dark:hover:border-red-600/70",
              warning: "hover:border-amber-400 dark:hover:border-amber-600/70",
              info: "hover:border-blue-400 dark:hover:border-blue-600/70",
              purple: "hover:border-purple-400 dark:hover:border-purple-600/70",
            }[item.badgeType];

            return (
              <div
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`group relative p-4 rounded-xl border border-gray-200/80 dark:border-gray-700/80 bg-white/60 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between ${cardBorderHighlight}`}
              >
                <div>
                  {/* Card Top: Icon & Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl p-2 rounded-xl bg-gray-50 dark:bg-gray-700/50 group-hover:scale-110 transition-transform">
                      {item.icon}
                    </span>
                    <span className={`px-2 py-0.5 text-[11px] font-bold rounded-md border ${badgeClasses}`}>
                      {item.badgeText}
                    </span>
                  </div>

                  {/* Count & Unit */}
                  <div className="flex items-baseline gap-1.5 mb-1">
                    <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                      {item.count}
                    </span>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      {item.unit}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                    {item.subtitle}
                  </p>
                </div>

                {/* Footer Action link */}
                <div className="pt-3 mt-3 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between text-xs font-semibold text-brand-600 dark:text-brand-400 group-hover:translate-x-0.5 transition-transform">
                  <span>{item.actionLabel}</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DashboardActionCenter;

