import React, { useState, useMemo } from "react";
import { toast } from "sonner";
import { AimsBasePageLayout, ViewMode, TreeFilterGroup } from "../../components/aims";
import PageMeta from "../../components/common/PageMeta";
import {
  MaintenanceTask,
  MaintenanceStatus,
} from "../../models/Maintenance/maintenancePlan";
import { maintenanceService } from "../../services/Maintenance/maintenanceService";
import { INITIAL_MAINTENANCE_TASKS } from "../../services/Maintenance/maintenanceMockData";
import { MaintenanceCalendarGrid } from "./components/MaintenanceCalendarGrid";
import { MaintenanceKanbanBoard } from "./components/MaintenanceKanbanBoard";
import { MaintenanceListView } from "./components/MaintenanceListView";
import { MaintenanceDetailModal } from "./components/MaintenanceDetailModal";
import { MaintenanceFormModal } from "./components/MaintenanceFormModal";
import { formatVND } from "./maintenanceHelper";

export const MaintenanceSchedulePage: React.FC = () => {
  const [tasks, setTasks] = useState<MaintenanceTask[]>(INITIAL_MAINTENANCE_TASKS);
  const [keyword, setKeyword] = useState<string>("");
  const [selectedFilter, setSelectedFilter] = useState<string | number | null>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("kanban"); // Mặc định chế độ Lịch / Kanban
  const [displayType, setDisplayType] = useState<"calendar" | "kanban" | "list">("calendar");

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [inspectingTask, setInspectingTask] = useState<MaintenanceTask | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [formInitialData, setFormInitialData] = useState<MaintenanceTask | null>(null);
  const [formSelectedDate, setFormSelectedDate] = useState<string | null>(null);

  // 1. Thống kê KPI tóm tắt
  const stats = useMemo(() => {
    const total = tasks.length;
    const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length;
    const completed = tasks.filter((t) => t.status === "COMPLETED").length;
    const overdue = tasks.filter((t) => t.status === "OVERDUE").length;
    const critical = tasks.filter((t) => t.priority === "CRITICAL").length;
    const totalEstimatedCost = tasks.reduce((sum, t) => sum + (t.estimatedCost || 0), 0);

    return { total, inProgress, completed, overdue, critical, totalEstimatedCost };
  }, [tasks]);

  // 2. Cây bộ lọc phân cấp (AimsTreeFilter)
  const treeGroups: TreeFilterGroup[] = useMemo(() => {
    const scheduledCount = tasks.filter((t) => t.status === "SCHEDULED").length;
    const inProgressCount = tasks.filter((t) => t.status === "IN_PROGRESS").length;
    const completedCount = tasks.filter((t) => t.status === "COMPLETED").length;
    const overdueCount = tasks.filter((t) => t.status === "OVERDUE").length;

    const preventiveCount = tasks.filter((t) => t.type === "PREVENTIVE").length;
    const correctiveCount = tasks.filter((t) => t.type === "CORRECTIVE").length;
    const upgradeCount = tasks.filter((t) => t.type === "UPGRADE").length;
    const warrantyCount = tasks.filter((t) => t.type === "WARRANTY").length;
    const inspectionCount = tasks.filter((t) => t.type === "INSPECTION").length;

    const criticalCount = tasks.filter((t) => t.priority === "CRITICAL").length;
    const highCount = tasks.filter((t) => t.priority === "HIGH").length;

    return [
      {
        id: "status",
        title: "TRẠNG THÁI KẾ HOẠCH",
        items: [
          { id: "all", label: "Tất cả kế hoạch", count: tasks.length },
          { id: "st_SCHEDULED", label: "Chờ thực hiện", count: scheduledCount },
          { id: "st_IN_PROGRESS", label: "Đang tiến hành", count: inProgressCount },
          { id: "st_COMPLETED", label: "Đã hoàn thành", count: completedCount },
          { id: "st_OVERDUE", label: "Quá hạn xử lý", count: overdueCount },
        ],
      },
      {
        id: "types",
        title: "LOẠI HÌNH BẢO TRÌ",
        items: [
          { id: "tp_PREVENTIVE", label: "Bảo trì định kỳ", count: preventiveCount },
          { id: "tp_CORRECTIVE", label: "Sửa chữa sự cố", count: correctiveCount },
          { id: "tp_UPGRADE", label: "Nâng cấp phần cứng", count: upgradeCount },
          { id: "tp_WARRANTY", label: "Bảo hành chính hãng", count: warrantyCount },
          { id: "tp_INSPECTION", label: "Kiểm định & Kiểm kê", count: inspectionCount },
        ],
      },
      {
        id: "priorities",
        title: "MỨC ĐỘ ƯU TIÊN",
        items: [
          { id: "pr_CRITICAL", label: "Khẩn cấp (Critical)", count: criticalCount },
          { id: "pr_HIGH", label: "Ưu tiên cao (High)", count: highCount },
        ],
      },
    ];
  }, [tasks]);

  // 3. Lọc danh sách theo từ khóa & Tree filter
  const filteredTasks = useMemo(() => {
    return tasks.filter((item) => {
      // Tìm kiếm từ khóa
      if (keyword.trim()) {
        const q = keyword.toLowerCase().trim();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchCode = item.planCode.toLowerCase().includes(q);
        const matchAsset = item.assetCode ? item.assetCode.toLowerCase().includes(q) : false;
        const matchAssetName = item.assetName ? item.assetName.toLowerCase().includes(q) : false;
        const matchUser = item.assignedTo ? item.assignedTo.toLowerCase().includes(q) : false;
        const matchLoc = item.locationName ? item.locationName.toLowerCase().includes(q) : false;

        if (!matchTitle && !matchCode && !matchAsset && !matchAssetName && !matchUser && !matchLoc) {
          return false;
        }
      }

      // Lọc theo cây phân cấp
      if (selectedFilter && selectedFilter !== "all") {
        const filterStr = String(selectedFilter);

        // Theo trạng thái
        if (filterStr.startsWith("st_")) {
          const st = filterStr.replace("st_", "");
          if (item.status !== st) return false;
        }

        // Theo loại
        if (filterStr.startsWith("tp_")) {
          const tp = filterStr.replace("tp_", "");
          if (item.type !== tp) return false;
        }

        // Theo ưu tiên
        if (filterStr.startsWith("pr_")) {
          const pr = filterStr.replace("pr_", "");
          if (item.priority !== pr) return false;
        }
      }

      return true;
    });
  }, [tasks, keyword, selectedFilter]);

  // 4. Các thao tác xử lý sự kiện
  const handleOpenDetail = (task: MaintenanceTask) => {
    setInspectingTask(task);
    setIsDetailOpen(true);
  };

  const handleAddNew = () => {
    setFormInitialData(null);
    setFormSelectedDate(null);
    setIsFormOpen(true);
  };

  const handleAddOnDate = (dateStr: string) => {
    setFormInitialData(null);
    setFormSelectedDate(dateStr);
    setIsFormOpen(true);
  };

  const handleEdit = (task: MaintenanceTask) => {
    setFormInitialData(task);
    setIsFormOpen(true);
  };

  const handleSaveForm = (taskData: Partial<MaintenanceTask>) => {
    if (taskData.id) {
      // Cập nhật
      setTasks((prev) =>
        prev.map((t) => (t.id === taskData.id ? ({ ...t, ...taskData } as MaintenanceTask) : t))
      );
      toast.success(`Đã cập nhật kế hoạch bảo trì [${taskData.planCode}]`);
    } else {
      // Tạo mới
      const newTask: MaintenanceTask = {
        id: `mnt-${Date.now()}`,
        planCode: taskData.planCode || `MNT-2026-${Math.floor(100 + Math.random() * 900)}`,
        title: taskData.title || "",
        type: taskData.type || "PREVENTIVE",
        status: taskData.status || "SCHEDULED",
        priority: taskData.priority || "MEDIUM",
        assetCode: taskData.assetCode || "",
        assetName: taskData.assetName || "",
        locationName: taskData.locationName || "",
        departmentName: taskData.departmentName || "",
        startDate: taskData.startDate || new Date().toISOString().split("T")[0],
        endDate: taskData.endDate || taskData.startDate || new Date().toISOString().split("T")[0],
        startTime: taskData.startTime || "09:00",
        endTime: taskData.endTime || "17:00",
        assignedTo: taskData.assignedTo || "",
        vendorName: taskData.vendorName || "",
        estimatedCost: taskData.estimatedCost || 0,
        description: taskData.description || "",
        checklist: taskData.checklist || [],
        notes: taskData.notes || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setTasks((prev) => [newTask, ...prev]);
      toast.success(`Đã tạo lịch bảo trì mới: ${newTask.title}`);
    }
  };

  const handleUpdateStatus = (taskId: string, newStatus: MaintenanceStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t))
    );
    if (inspectingTask && inspectingTask.id === taskId) {
      setInspectingTask((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const handleToggleChecklist = (taskId: string, checklistId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const updatedChecklist = (t.checklist || []).map((c) =>
          c.id === checklistId ? { ...c, completed: !c.completed } : c
        );
        return { ...t, checklist: updatedChecklist };
      })
    );
    if (inspectingTask && inspectingTask.id === taskId) {
      setInspectingTask((prev) => {
        if (!prev) return null;
        const updatedChecklist = (prev.checklist || []).map((c) =>
          c.id === checklistId ? { ...c, completed: !c.completed } : c
        );
        return { ...prev, checklist: updatedChecklist };
      });
    }
  };

  const handleDelete = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(taskId);
      return next;
    });
  };

  const handleExport = () => {
    const toExport =
      selectedIds.size > 0
        ? tasks.filter((t) => selectedIds.has(t.id))
        : filteredTasks;
    maintenanceService.exportToCsv(toExport);
    toast.success(`Đã xuất ${toExport.length} kế hoạch bảo trì ra file CSV thành công!`);
  };

  return (
    <>
      <PageMeta
        title="Lịch bảo trì & Kiểm định | AIMS Enterprise"
        description="Kế hoạch bảo trì định kỳ, sửa chữa sự cố, nâng cấp phần cứng và lịch bảo hành thiết bị CNTT"
      />

      <AimsBasePageLayout
        moduleName="Vận hành & Bảo trì"
        moduleIcon={
          <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        }
        moduleTabs={[
          { name: "Lịch bảo trì", path: "/lich-bao-tri", badge: filteredTasks.length },
          { name: "Loại bảo trì", path: "/loai-bao-tri" },
          { name: "Đơn vị tính", path: "/don-vi" },
        ]}
        title="Lịch bảo trì & Kiểm định"
        subtitle="Quản lý kế hoạch bảo dưỡng định kỳ, điều phối kỹ thuật viên, theo dõi tiến độ checklist & chi phí bảo trì thiết bị"
        totalRecords={filteredTasks.length}
        pageIndex={1}
        pageSize={filteredTasks.length}
        onPageChange={() => {}}
        searchTerm={keyword}
        onSearchChange={setKeyword}
        onAddNew={handleAddNew}
        addNewLabel="+ Lên lịch bảo trì"
        onExportExcel={handleExport}
        selectedCount={selectedIds.size}
        onClearSelection={() => setSelectedIds(new Set())}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        treeGroups={treeGroups}
        selectedTreeFilter={selectedFilter}
        onSelectTreeFilter={setSelectedFilter}
      >
        {/* KPI OVERVIEW CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
          <div className="p-3.5 rounded-xl bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Tổng kế hoạch</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{stats.total}</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
              📅
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">Đang tiến hành</p>
              <p className="text-xl font-bold text-amber-800 dark:text-amber-300 mt-0.5">{stats.inProgress}</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/60 flex items-center justify-center text-amber-700 dark:text-amber-300 font-bold">
              ⏳
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Đã hoàn thành</p>
              <p className="text-xl font-bold text-emerald-800 dark:text-emerald-300 mt-0.5">{stats.completed}</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-bold">
              ✓
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-rose-700 dark:text-rose-400">Quá hạn / Khẩn</p>
              <p className="text-xl font-bold text-rose-800 dark:text-rose-300 mt-0.5">
                {stats.overdue} <span className="text-xs text-rose-500 font-normal">({stats.critical} khẩn)</span>
              </p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-rose-100 dark:bg-rose-900/60 flex items-center justify-center text-rose-700 dark:text-rose-300 font-bold">
              ⚠️
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 p-3.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-900/40 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-purple-700 dark:text-purple-400">Dự toán ngân sách</p>
              <p className="text-base font-bold text-purple-900 dark:text-purple-300 mt-0.5 truncate">
                {formatVND(stats.totalEstimatedCost)}
              </p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-900/60 flex items-center justify-center text-purple-700 dark:text-purple-300 font-bold">
              💰
            </div>
          </div>
        </div>

        {/* VIEW SELECTOR BAR */}
        <div className="mb-4 flex items-center justify-between flex-wrap gap-3 p-2 bg-white dark:bg-gray-850 rounded-xl border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setDisplayType("calendar")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-2 ${
                displayType === "calendar"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              📅 Xem Lịch Tháng (Calendar Grid)
            </button>
            <button
              onClick={() => setDisplayType("kanban")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-2 ${
                displayType === "kanban"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              📊 Bảng Quy Trình (Kanban)
            </button>
            <button
              onClick={() => setDisplayType("list")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-2 ${
                displayType === "list"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              📑 Danh Sách Chi Tiết (Table)
            </button>
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
            <span>Hiển thị: <strong>{filteredTasks.length}</strong> kế hoạch bảo trì</span>
          </div>
        </div>

        {/* VIEW CONTENT */}
        {displayType === "calendar" && (
          <MaintenanceCalendarGrid
            tasks={filteredTasks}
            onSelectTask={handleOpenDetail}
            onAddOnDate={handleAddOnDate}
          />
        )}

        {displayType === "kanban" && (
          <MaintenanceKanbanBoard
            tasks={filteredTasks}
            onSelectTask={handleOpenDetail}
            onUpdateStatus={handleUpdateStatus}
            onAddNew={handleAddNew}
          />
        )}

        {displayType === "list" && (
          <MaintenanceListView
            tasks={filteredTasks}
            selectedIds={selectedIds}
            onToggleSelectRow={(id) => {
              setSelectedIds((prev) => {
                const next = new Set(prev);
                if (next.has(id)) next.delete(id);
                else next.add(id);
                return next;
              });
            }}
            onToggleSelectAll={(checked) => {
              if (checked) setSelectedIds(new Set(filteredTasks.map((t) => t.id)));
              else setSelectedIds(new Set());
            }}
            onSelectTask={handleOpenDetail}
            onUpdateStatus={handleUpdateStatus}
          />
        )}

        {/* MODAL CHI TIẾT */}
        <MaintenanceDetailModal
          isOpen={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false);
            setInspectingTask(null);
          }}
          task={inspectingTask}
          onUpdateStatus={handleUpdateStatus}
          onToggleChecklist={handleToggleChecklist}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {/* MODAL FORM TẠO MỚI / CHỈNH SỬA */}
        <MaintenanceFormModal
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setFormInitialData(null);
            setFormSelectedDate(null);
          }}
          initialData={formInitialData}
          selectedDate={formSelectedDate}
          onSave={handleSaveForm}
        />
      </AimsBasePageLayout>
    </>
  );
};

export default MaintenanceSchedulePage;
