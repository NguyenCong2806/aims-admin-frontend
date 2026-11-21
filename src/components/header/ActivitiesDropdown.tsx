import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { Dropdown } from "../ui/dropdown/Dropdown";

export interface ActivityTaskGroup {
  id: string;
  title: string;
  count: number;
  urgencyLabel: string;
  urgencyType: "danger" | "warning" | "info" | "success";
  path: string;
  description?: string;
}

const INITIAL_TASKS: ActivityTaskGroup[] = [
  {
    id: "task-resource-alert",
    title: "Máy trạm quá tải tài nguyên (RAM/Ổ cứng)",
    count: 5,
    urgencyLabel: "Hôm nay",
    urgencyType: "danger",
    path: "/giam-sat-may-tram",
    description: "5 thiết bị vượt ngưỡng 90% RAM hoặc ổ C: dưới 10% cần xử lý gấp.",
  },
  {
    id: "task-unauthorized-app",
    title: "Phần mềm lạ cần kiểm tra & gỡ bỏ",
    count: 3,
    urgencyLabel: "Gấp",
    urgencyType: "warning",
    path: "/giam-sat-may-tram/phan-mem",
    description: "3 máy trạm cài đặt phần mềm ngoài danh mục cho phép.",
  },
  {
    id: "task-license",
    title: "Giấy phép / License sắp hết hạn (30 ngày)",
    count: 8,
    urgencyLabel: "Đang chờ",
    urgencyType: "info",
    path: "/hop-dong-bao-hanh",
    description: "License bản quyền hệ điều hành & ứng dụng sắp đến ngày hết hạn.",
  },
];

export default function ActivitiesDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [tasks] = useState<ActivityTaskGroup[]>(INITIAL_TASKS);
  const navigate = useNavigate();

  const totalCount = useMemo(() => {
    return tasks.reduce((sum, item) => sum + item.count, 0);
  }, [tasks]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    closeDropdown();
  };

  const renderUrgencyBadge = (urgency: ActivityTaskGroup["urgencyType"]) => {
    switch (urgency) {
      case "danger":
        return "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/50 dark:border-rose-900/50";
      case "warning":
        return "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/50 dark:border-amber-900/50";
      case "info":
        return "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/50 dark:border-blue-900/50";
      case "success":
      default:
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-900/50";
    }
  };

  return (
    <div className="relative">
      {/* Icon đồng hồ chuẩn kích thước tròn h-10 w-10 tương đồng hoàn toàn với chuông thông báo */}
      <button
        className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full dropdown-toggle hover:text-gray-700 h-10 w-10 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white cursor-pointer shadow-2xs"
        onClick={toggleDropdown}
        title="Công việc & Hạn chót cần xử lý (SLA)"
        aria-label="Activities"
      >
        {/* Badge đếm số công việc tồn đọng */}
        {totalCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-rose-500 rounded-full shadow-xs ring-2 ring-white dark:ring-gray-900 animate-in zoom-in-75 duration-200">
            {totalCount > 99 ? "99+" : totalCount}
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
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute -right-20 sm:right-0 mt-2 flex w-[340px] sm:w-[380px] flex-col rounded-2xl border border-gray-200/80 bg-white p-0 shadow-2xl dark:border-gray-800 dark:bg-gray-900 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header Công việc cần xử lý */}
        <div className="flex items-center justify-between p-3.5 pb-2.5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40">
          <div className="flex items-center gap-2">
            <h5 className="text-sm font-bold text-gray-900 dark:text-gray-100">
              Công việc cần xử lý
            </h5>
            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
              {totalCount} việc chờ
            </span>
          </div>
          <button
            onClick={closeDropdown}
            className="text-xs text-brand-600 dark:text-brand-400 hover:underline cursor-pointer"
          >
            Đóng
          </button>
        </div>

        {/* Danh sách các nhóm công việc hành động */}
        <div className="p-2 space-y-2 max-h-[360px] overflow-y-auto">
          {tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => handleNavigate(task.path)}
              className="p-3 rounded-xl border border-gray-100 dark:border-gray-800/80 hover:bg-gray-50/80 dark:hover:bg-gray-800/60 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  <span className="font-bold text-sm mr-1.5">{task.count}</span>
                  {task.title}
                </span>
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${renderUrgencyBadge(
                    task.urgencyType
                  )}`}
                >
                  {task.urgencyLabel}
                </span>
              </div>
              {task.description && (
                <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1">
                  {task.description}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Footer điều hướng nhanh */}
        <div className="p-2.5 bg-gray-50/80 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 text-center">
          <button
            onClick={() => handleNavigate("/cong-viec-xu-ly")}
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <span>Xem toàn bộ công việc cần xử lý</span>
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </Dropdown>
    </div>
  );
}
