import React, { useState } from "react";
import { useLocation } from "react-router";

export interface TreeFilterItem {
  id: string | number;
  label: string;
  count?: number;
  icon?: React.ReactNode;
  children?: TreeFilterItem[];
}

export interface TreeFilterGroup {
  id: string;
  title: string;
  items: TreeFilterItem[];
}

export interface AimsTreeFilterProps {
  groups: TreeFilterGroup[];
  selectedId: string | number | null;
  onSelect: (id: string | number | null) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const AimsTreeFilter: React.FC<AimsTreeFilterProps> = ({
  groups,
  selectedId,
  onSelect,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const location = useLocation();
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    all: true,
  });

  const toggleNode = (nodeId: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNodes((prev) => ({
      ...prev,
      [String(nodeId)]: !prev[String(nodeId)],
    }));
  };

  if (isCollapsed) {
    return (
      <div className="hidden lg:flex flex-col items-center py-4 px-1.5 w-10 border-r border-gray-200/80 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60">
        <button
          onClick={onToggleCollapse}
          className="p-1.5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          title="Mở rộng bộ lọc phân cấp"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
        <span className="mt-8 text-[11px] font-bold text-gray-400 uppercase tracking-widest -rotate-90 select-none">
          Phân cấp
        </span>
      </div>
    );
  }

  const renderTreeItem = (item: TreeFilterItem, depth = 0) => {
    const isSelected =
      selectedId === item.id ||
      (typeof item.id === "string" && item.id === "tab_" + location.pathname);
    const hasChildren = item.children && item.children.length > 0;
    const isNodeExpanded = expandedNodes[String(item.id)] !== false;

    return (
      <div key={String(item.id)} className="w-full">
        <div
          onClick={() => onSelect(item.id)}
          style={{ paddingLeft: `${depth * 14 + 10}px` }}
          className={`group flex items-center justify-between py-1.5 pr-2.5 rounded-lg text-xs font-medium cursor-pointer select-none transition-all ${
            isSelected
              ? "bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 font-semibold"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100/70 dark:hover:bg-gray-800/70"
          }`}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            {hasChildren ? (
              <button
                onClick={(e) => toggleNode(item.id, e)}
                className="p-0.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer"
              >
                <svg
                  className={`w-3.5 h-3.5 transition-transform ${
                    isNodeExpanded ? "rotate-90" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <span className="w-3.5" />
            )}

            <span className="truncate">{item.label}</span>
          </div>

          {item.count !== undefined && (
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                isSelected
                  ? "bg-brand-200/80 dark:bg-brand-800/80 text-brand-900 dark:text-brand-100 font-bold"
                  : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600"
              }`}
            >
              {item.count}
            </span>
          )}
        </div>

        {hasChildren && isNodeExpanded && (
          <div className="space-y-0.5 mt-0.5">
            {item.children!.map((child) => renderTreeItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="w-60 sm:w-64 shrink-0 border-r border-gray-200/80 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xs p-3 transition-all flex flex-col">
      {/* Header with collapse button */}
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <span>Lọc phân cấp</span>
        </div>

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            title="Thu gọn bảng lọc cây"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        )}
      </div>

      {/* Filter Groups */}
      <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-220px)] pr-1 scrollbar-thin">
        {groups.map((group) => (
          <div key={group.id} className="space-y-1">
            <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-2">
              {group.title}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => renderTreeItem(item, 0))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default AimsTreeFilter;
