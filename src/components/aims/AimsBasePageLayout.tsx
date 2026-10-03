import React, { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router";
import AimsModuleNav, { NavTabItem } from "./AimsModuleNav";
import AimsControlPanel, { ViewMode } from "./AimsControlPanel";
import AimsTreeFilter, { TreeFilterGroup, TreeFilterItem } from "./AimsTreeFilter";

export type { ViewMode, NavTabItem, TreeFilterGroup, TreeFilterItem };

export interface AimsBasePageLayoutProps {
  /** Optional top module sub-navigation */
  moduleName?: string;
  moduleIcon?: React.ReactNode;
  moduleTabs?: NavTabItem[];

  /** Control panel properties */
  title: string;
  subtitle?: string;
  totalRecords: number;
  pageIndex?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddNew?: () => void;
  addNewLabel?: string;
  onExportExcel?: () => void;
  selectedCount?: number;
  onClearSelection?: () => void;
  onBatchDelete?: () => void;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  isFetching?: boolean;

  /** Optional left tree / facet filter */
  treeGroups?: TreeFilterGroup[];
  selectedTreeFilter?: string | number | null;
  onSelectTreeFilter?: (id: string | number | null) => void;
  isTreeCollapsed?: boolean;
  onToggleTreeCollapse?: () => void;

  /** Status states */
  isLoading?: boolean;
  loadingMessage?: string;
  error?: Error | string | null;

  /** Main content area (supports render prop with current viewMode or standard children) */
  children: React.ReactNode | ((viewMode: ViewMode) => React.ReactNode);
}

/**
 * AimsBasePageLayout: The unified, signature base layout for all pages in AIMS Enterprise.
 * Standardizes:
 *  1. Edge-to-edge Module Sub-Navigation (Module Name, Icon, Tabs).
 *  2. Control Panel (Action buttons, Batch Actions, Instant Search, Compact Pagination, List/Kanban Switcher).
 *  3. Left Tree/Facet Hierarchy Filter with collapse toggle (built-in across all pages).
 *  4. Full-width workspace for Table List / Kanban cards with smooth scrolling.
 */
export const AimsBasePageLayout: React.FC<AimsBasePageLayoutProps> = ({
  moduleName,
  moduleIcon,
  moduleTabs,

  title,
  subtitle,
  totalRecords,
  pageIndex = 1,
  pageSize = 20,
  onPageChange = () => {},
  searchTerm,
  onSearchChange,
  onAddNew,
  addNewLabel = "Thêm mới",
  onExportExcel,
  selectedCount = 0,
  onClearSelection,
  onBatchDelete,
  viewMode: controlledViewMode,
  onViewModeChange: controlledOnViewModeChange,
  isFetching = false,

  treeGroups,
  selectedTreeFilter,
  onSelectTreeFilter,
  isTreeCollapsed: controlledIsTreeCollapsed,
  onToggleTreeCollapse: controlledOnToggleTreeCollapse,

  isLoading = false,
  loadingMessage = "Đang tải dữ liệu...",
  error,

  children,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Internal state if viewMode is not controlled externally
  const [internalViewMode, setInternalViewMode] = useState<ViewMode>("list");
  const viewMode = controlledViewMode ?? internalViewMode;
  const handleViewModeChange = controlledOnViewModeChange ?? setInternalViewMode;

  // Internal state if tree collapse is not controlled externally
  const [internalTreeCollapsed, setInternalTreeCollapsed] = useState<boolean>(false);
  const isTreeCollapsed = controlledIsTreeCollapsed ?? internalTreeCollapsed;
  const handleToggleTreeCollapse =
    controlledOnToggleTreeCollapse ?? (() => setInternalTreeCollapsed((prev) => !prev));

  // Internal state for tree selection if not controlled externally
  const [internalSelectedTreeFilter, setInternalSelectedTreeFilter] = useState<string | number | null>("all");
  const activeTreeFilter = selectedTreeFilter !== undefined ? selectedTreeFilter : internalSelectedTreeFilter;

  // Build effective tree groups: Use provided treeGroups, or automatically generate default layout hierarchy!
  const effectiveTreeGroups = useMemo<TreeFilterGroup[]>(() => {
    if (treeGroups && treeGroups.length > 0) {
      return treeGroups;
    }

    const defaultGroups: TreeFilterGroup[] = [];

    // Group 1: Page Hierarchy / Filter
    defaultGroups.push({
      id: "hierarchy",
      title: `CÂY ${title.toUpperCase()}`,
      items: [
        {
          id: "all",
          label: `Tất cả ${title.toLowerCase()}`,
          count: totalRecords,
        },
        ...(selectedCount > 0
          ? [
              {
                id: "selected_only",
                label: `Đang chọn (${selectedCount})`,
                count: selectedCount,
              },
            ]
          : []),
      ],
    });

    // Group 2: Sibling module links if moduleTabs exist
    if (moduleTabs && moduleTabs.length > 0) {
      defaultGroups.push({
        id: "module_tabs",
        title: `PHÂN HỆ ${moduleName ? moduleName.toUpperCase() : "LIÊN KẾT"}`,
        items: moduleTabs.map((tab) => ({
          id: `tab_${tab.path}`,
          label: tab.name,
          count: tab.badge,
        })),
      });
    }

    return defaultGroups;
  }, [treeGroups, title, totalRecords, selectedCount, moduleTabs, moduleName]);

  const handleSelectTreeFilter = (id: string | number | null) => {
    if (onSelectTreeFilter) {
      onSelectTreeFilter(id);
      return;
    }

    setInternalSelectedTreeFilter(id);

    // If clicked on a module tab item, navigate to it
    if (typeof id === "string" && id.startsWith("tab_")) {
      const targetPath = id.replace("tab_", "");
      if (targetPath && targetPath !== location.pathname) {
        navigate(targetPath);
      }
    }
  };

  // Global loading state
  if (isLoading) {
    return (
      <div className="flex flex-col flex-1 w-full min-h-[450px] items-center justify-center bg-white dark:bg-gray-900">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-brand-500 border-t-transparent rounded-full animate-spin shadow-xs" />
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {loadingMessage}
          </span>
        </div>
      </div>
    );
  }

  // Global error state
  if (error) {
    const errorMsg = typeof error === "string" ? error : error.message || "Đã xảy ra lỗi không mong muốn.";
    return (
      <div className="flex flex-col flex-1 w-full min-h-[400px] items-center justify-center bg-white dark:bg-gray-900 p-6">
        <div className="max-w-md w-full p-6 text-center rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200/80 dark:border-red-900/50">
          <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
            Không thể tải dữ liệu
          </h3>
          <p className="text-sm text-red-600 dark:text-red-400">{errorMsg}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 w-full bg-white dark:bg-gray-900 overflow-hidden">
      {/* 1. HORIZONTAL MODULE NAVIGATION */}
      {moduleName && (
        <AimsModuleNav
          moduleName={moduleName}
          moduleIcon={moduleIcon}
          tabs={moduleTabs}
        />
      )}

      {/* 2. AIMS CONTROL PANEL */}
      <AimsControlPanel
        title={title}
        subtitle={subtitle}
        totalRecords={totalRecords}
        pageIndex={pageIndex}
        pageSize={pageSize}
        onPageChange={onPageChange}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        onAddNew={onAddNew}
        addNewLabel={addNewLabel}
        onExportExcel={onExportExcel}
        selectedCount={selectedCount}
        onClearSelection={onClearSelection}
        onBatchDelete={onBatchDelete}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        isFetching={isFetching}
      />

      {/* 3. SPLIT WORKSPACE (Tree/Facet Filter + Content Area) */}
      <div className="flex flex-1 overflow-hidden">
        {effectiveTreeGroups.length > 0 && (
          <AimsTreeFilter
            groups={effectiveTreeGroups}
            selectedId={activeTreeFilter}
            onSelect={handleSelectTreeFilter}
            isCollapsed={isTreeCollapsed}
            onToggleCollapse={handleToggleTreeCollapse}
          />
        )}

        {/* 4. MAIN CONTENT (List / Kanban) */}
        <main className="flex-1 flex flex-col min-w-0 overflow-auto bg-white dark:bg-gray-900">
          {typeof children === "function" ? children(viewMode) : children}
        </main>
      </div>
    </div>
  );
};

export default AimsBasePageLayout;
