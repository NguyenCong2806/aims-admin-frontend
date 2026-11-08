import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext";

// Assume these icons are imported from an icon library
import {
  BoxCubeIcon,
  ChevronDownIcon,
  DocsIcon,
  GridIcon,
  GroupIcon,
  HorizontaLDots,
  ListIcon,
  PieChartIcon,
  PlugInIcon,
  TaskIcon,
  UserIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  permission?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean; permission?: string }[];
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Tổng quan",
    subItems: [{ name: "Bảng điều khiển", path: "/", pro: false }],
  },
  {
    name: "Quản lý Tài sản IT",
    icon: <ListIcon />,
    subItems: [
      { name: "Thiết bị phần cứng", path: "/thiet-bi-phan-cung", pro: false, permission: "hardware_assets.view" },
      { name: "Thêm mới thiết bị", path: "/thiet-bi-phan-cung/tao-moi", pro: false, permission: "hardware_assets.create" },
      { name: "Giám sát máy trạm", path: "/giam-sat-may-tram", pro: false, permission: "monitoring.view" },
      { name: "Phần mềm theo máy", path: "/giam-sat-may-tram/phan-mem", pro: false, permission: "installed_software.view" },
      { name: "Tài nguyên số", path: "/tai-nguyen-so", pro: false, permission: "digital.view" },
      { name: "Tạo mới tài nguyên số", path: "/tai-nguyen-so/tao-moi", pro: false, permission: "digital.create" },
      { name: "Mẫu", path: "/form-elements", pro: false },
    ],
  },
  {
    name: "Hợp đồng & Đối tác",
    icon: <DocsIcon />,
    subItems: [
      { name: "Hợp đồng & Bảo hành", path: "/hop-dong-bao-hanh", pro: false, permission: "contracts.view" },
      { name: "Nhà cung cấp", path: "/nha-cung-cap", pro: false, permission: "suppliers.view" },
    ],
  },
  {
    name: "Báo cáo & Thống kê",
    icon: <PieChartIcon />,
    subItems: [
      { name: "Báo cáo & Phân tích", path: "/bao-cao-thong-ke", pro: false, permission: "reports.view" },
      { name: "Nhật ký hệ thống", path: "/nhat-ky-he-thong", pro: false, permission: "audit.view" },
    ],
  },
];

const othersItems: NavItem[] = [
  {
    icon: <GroupIcon />,
    name: "Tổ chức & Vị trí",
    subItems: [
      { name: "Phòng ban", path: "/phong-ban", pro: false, permission: "department.view" },
      { name: "Chức vụ", path: "/chuc-vu", pro: false, permission: "positions.view" },
      { name: "Địa điểm", path: "/dia-diem", pro: false, permission: "locations.view" },
      { name: "Trung tâm chi phí", path: "/trung-tam-chi-phi", pro: false, permission: "cost-center.view" },
    ],
  },
  {
    icon: <BoxCubeIcon />,
    name: "Tài sản & Phần cứng",
    subItems: [
      { name: "Danh mục sản phẩm", path: "/danh-muc-san-pham", pro: false, permission: "asset-categories.view" },
      { name: "Hãng sản xuất", path: "/hang-san-xuat", pro: false, permission: "brands.view" },
      { name: "Loại tài sản", path: "/loai-tai-san", pro: false, permission: "asset-types.view" },
      { name: "Trạng thái tài sản", path: "/trang-thai-tai-san", pro: false, permission: "asset-status.view" },
    ],
  },
  {
    icon: <PlugInIcon />,
    name: "Phần mềm & Giấy phép",
    subItems: [
      { name: "Loại giấy phép", path: "/loai-giay-phep", pro: false, permission: "license-type.view" },
    ],
  },
  {
    icon: <TaskIcon />,
    name: "Vận hành & Bảo trì",
    subItems: [
      { name: "Lịch bảo trì", path: "/lich-bao-tri", pro: false, permission: "maintenance.view" },
      { name: "Loại bảo trì", path: "/loai-bao-tri", pro: false, permission: "maintenance-type.view" },
      { name: "Đơn vị", path: "/don-vi", pro: false, permission: "units.view" },
    ],
  },
  {
    icon: <UserIcon />,
    name: "Người dùng",
    subItems: [
      { name: "Tài khoản", path: "/tai-khoan", pro: false, permission: "accounts.view" },
      { name: "Phân quyền", path: "/phan-quyen", pro: false, permission: "roles.view" },
      { name: "Cấu hình hệ thống", path: "/cau-hinh-he-thong", pro: false, permission: "settings.view" },
    ],
  },
  {
    icon: <PlugInIcon />,
    name: "Authentication",
    subItems: [
      { name: "Sign In", path: "/signin", pro: false },
      { name: "Sign Up", path: "/signup", pro: false },
    ],
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  const { hasPermission } = useAuth();

  // Lọc danh sách menu dựa trên quyền hạn tài khoản (chỉ hiện khi có quyền .view tương ứng)
  const filterNavList = useCallback(
    (items: NavItem[]): NavItem[] => {
      return items
        .map((item) => {
          if (item.subItems) {
            const filteredSubs = item.subItems.filter((sub) => {
              if (!sub.permission) return true;
              return hasPermission(sub.permission);
            });
            if (filteredSubs.length === 0) return null;
            return { ...item, subItems: filteredSubs };
          }
          if (item.permission && !hasPermission(item.permission)) {
            return null;
          }
          return item;
        })
        .filter(Boolean) as NavItem[];
    },
    [hasPermission]
  );

  const visibleNavItems = useMemo(() => filterNavList(navItems), [filterNavList]);
  const visibleOthersItems = useMemo(() => filterNavList(othersItems), [filterNavList]);

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // const isActive = (path: string) => location.pathname === path;
  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? visibleNavItems : visibleOthersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive, visibleNavItems, visibleOthersItems]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={`menu-item-icon-size  ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`menu-item-icon-size ${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="dark:hidden"
                src="/images/logo/logo.svg"
                alt="Logo"
                width={150}
                height={40}
              />
              <img
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <img
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(visibleNavItems, "main")}
            </div>
            <div className="">
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Hệ thống"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(visibleOthersItems, "others")}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
