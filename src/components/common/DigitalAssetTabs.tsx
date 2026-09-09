import { useState } from "react";

interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface DigitalAssetTabsProps {
  tabs: TabItem[];
  onTabChange: (tabId: string) => void;
  defaultTab?: string;
}

const DigitalAssetTabs: React.FC<DigitalAssetTabsProps> = ({
  tabs,
  onTabChange,
  defaultTab,
}) => {
  const [selectedTab, setSelectedTab] = useState<string>(
    defaultTab || tabs[0]?.id || ""
  );

  const handleTabChange = (tabId: string) => {
    setSelectedTab(tabId);
    onTabChange(tabId);
  };

  return (
    <div className="flex flex-col">
      {/* Tab Headers */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-0 overflow-x-auto" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              role="tab"
              aria-selected={selectedTab === tab.id}
              className={`
                px-4 py-3 font-medium text-sm whitespace-nowrap transition-colors
                border-b-2 -mb-[2px]
                ${
                  selectedTab === tab.id
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                }
              `}
            >
              {tab.icon && <span className="mr-2">{tab.icon}</span>}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default DigitalAssetTabs;
