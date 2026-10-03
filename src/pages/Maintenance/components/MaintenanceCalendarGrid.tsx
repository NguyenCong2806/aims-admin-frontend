import React, { useState, useMemo } from "react";
import { MaintenanceTask } from "../../../models/Maintenance/maintenancePlan";
import { MAINTENANCE_TYPE_META, MAINTENANCE_STATUS_META } from "../maintenanceHelper";

interface MaintenanceCalendarGridProps {
  tasks: MaintenanceTask[];
  onSelectTask: (task: MaintenanceTask) => void;
  onAddOnDate: (dateStr: string) => void;
}

export const MaintenanceCalendarGrid: React.FC<MaintenanceCalendarGridProps> = ({
  tasks,
  onSelectTask,
  onAddOnDate,
}) => {
  const [currentDate, setCurrentDate] = useState(() => new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0 - 11

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Tính toán các ngày trong lưới lịch (Tháng hiện tại + các ngày đệm)
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startingDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7; // Thứ 2 = 0, Chủ nhật = 6
    const totalDaysInMonth = lastDayOfMonth.getDate();

    const days: Array<{
      date: Date;
      dateStr: string;
      isCurrentMonth: boolean;
      isToday: boolean;
    }> = [];

    const todayStr = new Date().toISOString().split("T")[0];

    // Ngày đệm tháng trước
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      const str = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate()
      ).padStart(2, "0")}`;
      days.push({
        date: d,
        dateStr: str,
        isCurrentMonth: false,
        isToday: str === todayStr,
      });
    }

    // Các ngày trong tháng
    for (let i = 1; i <= totalDaysInMonth; i++) {
      const d = new Date(year, month, i);
      const str = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      days.push({
        date: d,
        dateStr: str,
        isCurrentMonth: true,
        isToday: str === todayStr,
      });
    }

    // Ngày đệm tháng sau để lấp đầy bội số 7
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const d = new Date(year, month + 1, i);
      const str = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate()
      ).padStart(2, "0")}`;
      days.push({
        date: d,
        dateStr: str,
        isCurrentMonth: false,
        isToday: str === todayStr,
      });
    }

    return days;
  }, [year, month]);

  // Gom nhóm task theo ngày (đáp ứng cả task kéo dài nhiều ngày)
  const tasksByDate = useMemo(() => {
    const map: Record<string, MaintenanceTask[]> = {};

    tasks.forEach((t) => {
      // Giản lược: ánh xạ theo startDate
      const dStr = t.startDate;
      if (!map[dStr]) map[dStr] = [];
      map[dStr].push(t);
    });

    return map;
  }, [tasks]);

  const monthNamesVi = [
    "Tháng Một",
    "Tháng Hai",
    "Tháng Ba",
    "Tháng Tư",
    "Tháng Năm",
    "Tháng Sáu",
    "Tháng Bảy",
    "Tháng Tám",
    "Tháng Chín",
    "Tháng Mười",
    "Tháng Mười Một",
    "Tháng Mười Hai",
  ];

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-850 shadow-sm overflow-hidden flex flex-col">
      {/* CALENDAR CONTROLS & HEADER */}
      <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between flex-wrap gap-3 bg-gradient-to-r from-gray-50/70 to-white dark:from-gray-900/40 dark:to-gray-850">
        <div className="flex items-center gap-3">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span>📅 {monthNamesVi[month]}, {year}</span>
          </h2>
          <button
            onClick={handleToday}
            className="px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 rounded-lg border border-indigo-200/60 dark:border-indigo-800 transition"
          >
            Hôm nay
          </button>
        </div>

        {/* LEGEND & PREV/NEXT */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="hidden lg:flex items-center gap-2.5 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Định kỳ
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Sửa chữa
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Nâng cấp
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span> Bảo hành
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span> Kiểm định
            </span>
          </div>

          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-white dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 transition"
              title="Tháng trước"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-white dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 transition"
              title="Tháng sau"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* WEEK DAYS HEADER */}
      <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 py-2.5">
        <div>Thứ Hai</div>
        <div>Thứ Ba</div>
        <div>Thứ Tư</div>
        <div>Thứ Năm</div>
        <div>Thứ Sáu</div>
        <div className="text-indigo-600 dark:text-indigo-400">Thứ Bảy</div>
        <div className="text-rose-600 dark:text-rose-400">Chủ Nhật</div>
      </div>

      {/* MONTH GRID CELLS */}
      <div className="grid grid-cols-7 divide-x divide-y divide-gray-100 dark:divide-gray-800 border-b border-gray-200 dark:border-gray-800">
        {calendarDays.map((day, idx) => {
          const dayTasks = tasksByDate[day.dateStr] || [];
          const isSelectedMonth = day.isCurrentMonth;

          return (
            <div
              key={idx}
              onClick={() => onAddOnDate(day.dateStr)}
              className={`min-h-[105px] sm:min-h-[120px] p-1.5 sm:p-2 flex flex-col justify-between transition group relative ${
                isSelectedMonth
                  ? "bg-white dark:bg-gray-850 hover:bg-indigo-50/20 dark:hover:bg-gray-800/40"
                  : "bg-gray-50/50 dark:bg-gray-900/30 text-gray-300 dark:text-gray-600"
              }`}
            >
              {/* CELL HEADER: DAY NUMBER & ADD BUTTON */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                    day.isToday
                      ? "bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-200 dark:ring-indigo-900"
                      : isSelectedMonth
                      ? "text-gray-800 dark:text-gray-200"
                      : "text-gray-400 dark:text-gray-600"
                  }`}
                >
                  {day.date.getDate()}
                </span>

                {/* Quick Add Button on Hover */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddOnDate(day.dateStr);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                  title="Thêm lịch vào ngày này"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>

              {/* TASKS IN THIS DAY */}
              <div className="flex-1 mt-1 space-y-1 overflow-hidden">
                {dayTasks.slice(0, 3).map((task) => {
                  const typeMeta = MAINTENANCE_TYPE_META[task.type] || MAINTENANCE_TYPE_META.PREVENTIVE;
                  const statusMeta = MAINTENANCE_STATUS_META[task.status] || MAINTENANCE_STATUS_META.SCHEDULED;

                  return (
                    <div
                      key={task.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTask(task);
                      }}
                      className={`px-1.5 py-0.5 rounded-md text-[11px] font-medium border truncate cursor-pointer transition shadow-2xs hover:scale-[1.02] flex items-center gap-1 ${typeMeta.badgeClass}`}
                      title={`${task.planCode}: ${task.title} (${statusMeta.label})`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusMeta.dotClass}`}></span>
                      <span className="truncate">{task.title}</span>
                      {task.priority === "CRITICAL" && (
                        <span className="text-[10px] text-rose-600 font-bold">!</span>
                      )}
                    </div>
                  );
                })}

                {dayTasks.length > 3 && (
                  <div className="text-[10px] text-center font-bold text-indigo-600 dark:text-indigo-400 pt-0.5">
                    +{dayTasks.length - 3} lịch nữa
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
