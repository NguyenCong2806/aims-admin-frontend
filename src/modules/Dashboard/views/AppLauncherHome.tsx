import React, { useState, useMemo } from "react";
import { Link } from "react-router";
import PageMeta from "../../../components/common/PageMeta";
import { useAuth } from "../../../context/AuthContext";
import { useSearch } from "../../../context/SearchContext";

interface AppModule {
  id: string;
  name: string;
  path: string;
  category: "asset" | "org" | "lookup" | "operation" | "system";
  badge?: string;
  badgeColor?: string;
  description: string;
  permission?: string;
  renderIcon: () => React.ReactNode;
}

export default function AppLauncherHome() {
  const { hasPermission } = useAuth();
  const { searchTerm, clearSearch } = useSearch();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const appModules: AppModule[] = [
    // 1. Quản lý tài sản
    {
      id: "digital-assets",
      name: "Tài nguyên số",
      path: "/tai-nguyen-so",
      category: "asset",
      badge: "Chính",
      badgeColor: "bg-blue-500",
      description: "Quản lý phần mềm, dữ liệu & tài nguyên số",
      permission: "digital.view",
      renderIcon: () => (
        <svg viewBox="0 0 64 64" className="w-full h-full filter drop-shadow-[0_6px_10px_rgba(37,99,235,0.25)]">
          <defs>
            <radialGradient id="g3d_dig_shadow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="g3d_dig_screen" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
            <linearGradient id="g3d_dig_bevel" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="g3d_dig_base" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>
          </defs>
          <ellipse cx="32" cy="56" rx="24" ry="5" fill="url(#g3d_dig_shadow)" />
          {/* Monitor Frame Depth */}
          <rect x="9" y="11" width="46" height="34" rx="7" fill="#1e40af" />
          {/* Monitor Screen 3D */}
          <rect x="9" y="9" width="46" height="34" rx="7" fill="url(#g3d_dig_screen)" />
          {/* Screen Top Gloss */}
          <path d="M12 11h40a4 4 0 014 4v10L10 18v-3a4 4 0 014-4z" fill="url(#g3d_dig_bevel)" />
          {/* Inner Code/Data Cards Floating */}
          <rect x="15" y="15" width="22" height="11" rx="3" fill="#ffffff" fillOpacity="0.3" />
          <rect x="18" y="19" width="10" height="2" rx="1" fill="#ffffff" />
          <rect x="18" y="23" width="14" height="2" rx="1" fill="#ffffff" fillOpacity="0.8" />
          <circle cx="33" cy="20" r="2" fill="#a5f3fc" />
          {/* Floating 3D Data Cube */}
          <path d="M42 20l7-4 7 4v8l-7 4-7-4z" fill="#0284c7" />
          <path d="M42 20l7-4 7 4-7 4z" fill="#38bdf8" />
          <path d="M49 24v8l7-4v-8z" fill="#0369a1" />
          {/* Laptop / Base Pedestal */}
          <path d="M6 46c0-2 2-3 4-3h44c2 0 4 1 4 3l-3 6H9l-3-6z" fill="url(#g3d_dig_base)" />
          <path d="M22 46h20v2H22z" fill="#64748b" />
          {/* Glowing Front Edge */}
          <rect x="8" y="51" width="48" height="2" rx="1" fill="#38bdf8" />
        </svg>
      ),
    },
    {
      id: "hardware",
      name: "Thiết bị phần cứng",
      path: "/thiet-bi-phan-cung",
      category: "asset",
      description: "Máy chủ, laptop, máy trạm và linh kiện IT",
      permission: "hardware_assets.view",
      renderIcon: () => (
        <svg viewBox="0 0 64 64" className="w-full h-full filter drop-shadow-[0_6px_10px_rgba(99,102,241,0.25)]">
          <defs>
            <radialGradient id="g3d_hw_shadow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1e1b4b" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="g3d_hw_body" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#4338ca" />
            </linearGradient>
            <linearGradient id="g3d_hw_glass" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e1b4b" />
              <stop offset="100%" stopColor="#312e81" />
            </linearGradient>
          </defs>
          <ellipse cx="32" cy="56" rx="22" ry="4.5" fill="url(#g3d_hw_shadow)" />
          {/* Metallic Stand */}
          <path d="M28 40h8v10h-8z" fill="#64748b" />
          <path d="M22 50h20l2 4H20l2-4z" fill="#94a3b8" />
          {/* Monitor Frame Depth */}
          <rect x="7" y="11" width="50" height="32" rx="6" fill="#312e81" />
          {/* Monitor Body */}
          <rect x="7" y="9" width="50" height="32" rx="6" fill="url(#g3d_hw_body)" />
          {/* Screen Display */}
          <rect x="10" y="12" width="44" height="24" rx="4" fill="url(#g3d_hw_glass)" />
          {/* Screen Content / Graph */}
          <path d="M14 28l7-6 6 4 10-9 7 5" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <circle cx="37" cy="17" r="2" fill="#f43f5e" />
          {/* Top Glass Gloss */}
          <path d="M10 12h44L36 24H10v-12z" fill="#ffffff" fillOpacity="0.15" />
          {/* Front Camera Dot */}
          <circle cx="32" cy="10.5" r="1" fill="#a5b4fc" />
          {/* Chin Bar */}
          <rect x="7" y="37" width="50" height="4" rx="2" fill="#4f46e5" />
        </svg>
      ),
    },
    {
      id: "workstation-monitoring",
      name: "Giám sát máy trạm",
      path: "/giam-sat-may-tram",
      category: "asset",
      description: "Theo dõi tình trạng hoạt động các máy trạm",
      permission: "monitoring.view",
      renderIcon: () => (
        <svg viewBox="0 0 64 64" className="w-full h-full filter drop-shadow-[0_6px_10px_rgba(14,165,233,0.3)]">
          <defs>
            <radialGradient id="g3d_mon_shadow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#082f49" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#082f49" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="g3d_mon_sphere" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="#0369a1" />
            </linearGradient>
            <linearGradient id="g3d_mon_sweep" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
            </linearGradient>
          </defs>
          <ellipse cx="32" cy="56" rx="22" ry="5" fill="url(#g3d_mon_shadow)" />
          {/* 3D Sphere Base / Depth */}
          <circle cx="32" cy="34" r="23" fill="#075985" />
          {/* 3D Orb */}
          <circle cx="32" cy="31" r="23" fill="url(#g3d_mon_sphere)" />
          {/* Gloss Top Crescent */}
          <path d="M12 24a23 23 0 0140 0c-4-7-14-11-20-11s-16 4-20 11z" fill="#ffffff" fillOpacity="0.4" />
          {/* Radar Grid Rings in 3D Perspective */}
          <ellipse cx="32" cy="31" rx="17" ry="17" stroke="#e0f2fe" strokeWidth="1.5" strokeDasharray="3 2" fill="none" opacity="0.6" />
          <ellipse cx="32" cy="31" rx="10" ry="10" stroke="#ffffff" strokeWidth="1.5" fill="none" opacity="0.8" />
          {/* Radar Sweep Sector */}
          <path d="M32 31L48 16a23 23 0 00-16-5v20z" fill="url(#g3d_mon_sweep)" />
          {/* Center Target & Ping */}
          <circle cx="32" cy="31" r="3.5" fill="#ffffff" />
          <circle cx="42" cy="22" r="3" fill="#fef08a" />
          <circle cx="23" cy="37" r="2" fill="#a7f3d0" />
        </svg>
      ),
    },

    // 2. Danh mục & Cấu hình hệ thống (Lookups)
    {
      id: "asset-categories",
      name: "Danh mục tài sản",
      path: "/danh-muc-san-pham",
      category: "lookup",
      description: "Phân nhóm tài sản CNTT & thiết bị văn phòng",
      permission: "asset-categories.view",
      renderIcon: () => (
        <svg viewBox="0 0 64 64" className="w-full h-full filter drop-shadow-[0_6px_10px_rgba(245,158,11,0.3)]">
          <defs>
            <radialGradient id="g3d_cat_shadow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#78350f" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#78350f" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="g3d_cat_back" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <linearGradient id="g3d_cat_front" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="20%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
          </defs>
          <ellipse cx="32" cy="56" rx="22" ry="4.5" fill="url(#g3d_cat_shadow)" />
          {/* Back folder body */}
          <path d="M8 18a4 4 0 014-4h15l4 5h25a4 4 0 014 4v26a4 4 0 01-4 4H12a4 4 0 01-4-4V18z" fill="url(#g3d_cat_back)" />
          {/* 3D Paper Inserts / Files inside */}
          <rect x="14" y="16" width="36" height="20" rx="3" fill="#ffffff" fillOpacity="0.9" />
          <rect x="18" y="20" width="16" height="2" rx="1" fill="#94a3b8" />
          <rect x="18" y="24" width="24" height="2" rx="1" fill="#cbd5e1" />
          {/* Colorful Index Tabs */}
          <rect x="34" y="13" width="8" height="5" rx="1.5" fill="#38bdf8" />
          <rect x="43" y="13" width="8" height="5" rx="1.5" fill="#ec4899" />
          {/* Front 3D Folder Flap */}
          <path d="M6 27c0-2 1.5-4 3.5-4.2l44.8-4.2c2.2-.2 4.2 1.5 4.4 3.7l2.1 21.2c.2 2.2-1.5 4.2-3.7 4.4L12.3 53c-2.2.2-4.2-1.5-4.4-3.7L6 27z" fill="url(#g3d_cat_front)" />
          {/* Gloss Sheen on flap */}
          <path d="M10 26l44-4-2 6-42 4z" fill="#ffffff" fillOpacity="0.4" />
          {/* Embossed badge icon */}
          <circle cx="32" cy="38" r="4.5" fill="#ffffff" fillOpacity="0.8" />
          <path d="M30 38h4m-2-2v4" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: "brands",
      name: "Hãng sản xuất",
      path: "/hang-san-xuat",
      category: "lookup",
      description: "Thương hiệu sản xuất thiết bị (Dell, HP, Apple...)",
      permission: "brands.view",
      renderIcon: () => (
        <svg viewBox="0 0 64 64" className="w-full h-full filter drop-shadow-[0_6px_10px_rgba(249,115,22,0.3)]">
          <defs>
            <radialGradient id="g3d_br_shadow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#7c2d12" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#7c2d12" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="g3d_br_top" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fed7aa" />
              <stop offset="100%" stopColor="#fb923c" />
            </linearGradient>
            <linearGradient id="g3d_br_left" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
            <linearGradient id="g3d_br_right" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ea580c" />
              <stop offset="100%" stopColor="#c2410c" />
            </linearGradient>
          </defs>
          <ellipse cx="32" cy="56" rx="20" ry="4.5" fill="url(#g3d_br_shadow)" />
          {/* 3D Extruded Depth Underneath */}
          <polygon points="32,10 54,23 54,47 32,58 10,47 10,23" fill="#9a3412" transform="translate(0, 3)" />
          {/* Faceted Hexagon 3D Front Faces */}
          <polygon points="32,9 54,22 32,34 10,22" fill="url(#g3d_br_top)" />
          <polygon points="10,22 32,34 32,56 10,45" fill="url(#g3d_br_left)" />
          <polygon points="32,34 54,22 54,45 32,56" fill="url(#g3d_br_right)" />
          {/* Central 3D Floating Crystal Star */}
          <polygon points="32,22 35,29 42,30 37,35 38,42 32,38 26,42 27,35 22,30 29,29" fill="#ffffff" />
          <polygon points="32,22 35,29 32,38 29,29" fill="#fff7ed" />
          {/* Gloss Sheen Edge */}
          <path d="M32 9L54 22" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: "asset-types",
      name: "Loại tài sản",
      path: "/loai-tai-san",
      category: "lookup",
      description: "Định nghĩa phân loại tài sản vô hình / hữu hình",
      permission: "asset-types.view",
      renderIcon: () => (
        <svg viewBox="0 0 64 64" className="w-full h-full filter drop-shadow-[0_6px_12px_rgba(244,63,94,0.32)]">
          <defs>
            <radialGradient id="g3d_typ_shadow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#4c0519" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#4c0519" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="g3d_typ_plate1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fda4af" />
              <stop offset="40%" stopColor="#fb7185" />
              <stop offset="100%" stopColor="#e11d48" />
            </linearGradient>
            <linearGradient id="g3d_typ_plate2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#9f1239" />
            </linearGradient>
            <linearGradient id="g3d_typ_gloss" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <ellipse cx="32" cy="56" rx="22" ry="5" fill="url(#g3d_typ_shadow)" />
          {/* Bottom 3D Plate with depth */}
          <rect x="10" y="24" width="34" height="30" rx="9" fill="#881337" />
          <rect x="10" y="20" width="34" height="30" rx="9" fill="url(#g3d_typ_plate2)" />
          <path d="M12 22h30a7 7 0 017 7v4L12 30v-8z" fill="url(#g3d_typ_gloss)" opacity="0.3" />
          {/* Top 3D Plate hovering with offset & shadow */}
          <rect x="22" y="14" width="34" height="30" rx="9" fill="#9f1239" opacity="0.6" />
          <rect x="20" y="10" width="34" height="30" rx="9" fill="url(#g3d_typ_plate1)" />
          {/* Gloss sheen on top plate */}
          <path d="M22 12h30a7 7 0 017 7v4L22 20v-8z" fill="url(#g3d_typ_gloss)" opacity="0.6" />
          {/* Embossed 3D geometric card symbols */}
          <rect x="26" y="17" width="14" height="4" rx="2" fill="#ffffff" />
          <rect x="26" y="24" width="22" height="3.5" rx="1.75" fill="#ffffff" fillOpacity="0.9" />
          <rect x="26" y="30" width="16" height="3" rx="1.5" fill="#ffffff" fillOpacity="0.75" />
          {/* Floating mini orb */}
          <circle cx="48" cy="16" r="2.5" fill="#fff1f2" />
        </svg>
      ),
    },
    {
      id: "asset-status",
      name: "Trạng thái tài sản",
      path: "/trang-thai-tai-san",
      category: "lookup",
      description: "Đang sử dụng, bảo dưỡng, hỏng hóc, thanh lý",
      permission: "asset-status.view",
      renderIcon: () => (
        <svg viewBox="0 0 64 64" className="w-full h-full filter drop-shadow-[0_6px_12px_rgba(16,185,129,0.35)]">
          <defs>
            <radialGradient id="g3d_sta_shadow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#022c22" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#022c22" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="g3d_sta_sphere" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#6ee7b7" />
              <stop offset="35%" stopColor="#10b981" />
              <stop offset="75%" stopColor="#059669" />
              <stop offset="100%" stopColor="#044e3a" />
            </radialGradient>
            <linearGradient id="g3d_sta_check" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#d1fae5" />
            </linearGradient>
          </defs>
          <ellipse cx="32" cy="56" rx="21" ry="5" fill="url(#g3d_sta_shadow)" />
          {/* 3D Depth Layer */}
          <circle cx="32" cy="34" r="23" fill="#064e3b" />
          {/* 3D Spherical Orb */}
          <circle cx="32" cy="31" r="23" fill="url(#g3d_sta_sphere)" />
          {/* Specular Highlight Sheen */}
          <ellipse cx="26" cy="20" rx="10" ry="5" fill="#ffffff" fillOpacity="0.45" transform="rotate(-25 26 20)" />
          <circle cx="21" cy="18" r="2" fill="#ffffff" fillOpacity="0.8" />
          {/* 3D Embossed Checkmark with drop shadow */}
          <path
            d="M21 32l8 8 16-16"
            stroke="#044e3a"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            transform="translate(0, 2)"
            opacity="0.5"
          />
          <path
            d="M21 31l8 8 16-16"
            stroke="url(#g3d_sta_check)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      ),
    },

    // 3. Tổ chức & Vị trí (Organization)
    {
      id: "departments",
      name: "Phòng ban",
      path: "/phong-ban",
      category: "org",
      description: "Cơ cấu phòng ban, đơn vị thành viên",
      permission: "department.view",
      renderIcon: () => (
        <svg viewBox="0 0 64 64" className="w-full h-full filter drop-shadow-[0_6px_12px_rgba(139,92,246,0.3)]">
          <defs>
            <radialGradient id="g3d_dep_shadow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#2e1065" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#2e1065" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="g3d_dep_main" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="50%" stopColor="#9333ea" />
              <stop offset="100%" stopColor="#6b21a8" />
            </linearGradient>
            <linearGradient id="g3d_dep_sub" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d8b4fe" />
              <stop offset="60%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#7e22ce" />
            </linearGradient>
          </defs>
          <ellipse cx="32" cy="56" rx="22" ry="4.5" fill="url(#g3d_dep_shadow)" />
          {/* 3D Connecting Pipes with thickness */}
          <path d="M32 24v11m-15 0h30m-30 0v8m30-8v8" stroke="#4c1d95" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" transform="translate(0, 1.5)" opacity="0.4" />
          <path d="M32 24v11m-15 0h30m-30 0v8m30-8v8" stroke="#d8b4fe" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M32 24v11m-15 0h30m-30 0v8m30-8v8" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
          {/* Top Leader Pod 3D */}
          <rect x="20" y="8" width="24" height="18" rx="6" fill="#581c87" transform="translate(0, 2)" />
          <rect x="20" y="8" width="24" height="18" rx="6" fill="url(#g3d_dep_main)" />
          <ellipse cx="32" cy="12" rx="9" ry="2.5" fill="#ffffff" fillOpacity="0.45" />
          <circle cx="32" cy="17" r="3.5" fill="#ffffff" />
          {/* Left Subordinate Pod 3D */}
          <rect x="7" y="38" width="20" height="16" rx="5" fill="#581c87" transform="translate(0, 2)" />
          <rect x="7" y="38" width="20" height="16" rx="5" fill="url(#g3d_dep_sub)" />
          <ellipse cx="17" cy="41" rx="7" ry="2" fill="#ffffff" fillOpacity="0.4" />
          <circle cx="17" cy="46" r="3" fill="#ffffff" />
          {/* Right Subordinate Pod 3D */}
          <rect x="37" y="38" width="20" height="16" rx="5" fill="#581c87" transform="translate(0, 2)" />
          <rect x="37" y="38" width="20" height="16" rx="5" fill="url(#g3d_dep_sub)" />
          <ellipse cx="47" cy="41" rx="7" ry="2" fill="#ffffff" fillOpacity="0.4" />
          <circle cx="47" cy="46" r="3" fill="#ffffff" />
        </svg>
      ),
    },
    {
      id: "positions",
      name: "Chức vụ",
      path: "/chuc-vu",
      category: "org",
      description: "Chức danh, vai trò quản lý trong tổ chức",
      permission: "positions.view",
      renderIcon: () => (
        <svg viewBox="0 0 64 64" className="w-full h-full filter drop-shadow-[0_6px_12px_rgba(59,130,246,0.32)]">
          <defs>
            <radialGradient id="g3d_pos_shadow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="g3d_pos_card" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="40%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
            <linearGradient id="g3d_pos_metal" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
          </defs>
          <ellipse cx="32" cy="56" rx="20" ry="4.5" fill="url(#g3d_pos_shadow)" />
          {/* Lanyard Strap */}
          <path d="M28 2v10h8V2" stroke="#60a5fa" strokeWidth="4" strokeLinecap="round" />
          {/* Metallic Clasp */}
          <rect x="26" y="8" width="12" height="6" rx="2" fill="url(#g3d_pos_metal)" />
          <ellipse cx="32" cy="11" rx="2" ry="1" fill="#1e293b" />
          {/* 3D Badge Depth Underneath */}
          <rect x="11" y="15" width="42" height="40" rx="9" fill="#1e3a8a" transform="translate(0, 3)" />
          {/* 3D Badge Card */}
          <rect x="11" y="14" width="42" height="40" rx="9" fill="url(#g3d_pos_card)" />
          {/* Card Slot Opening */}
          <rect x="24" y="18" width="16" height="3" rx="1.5" fill="#1e3a8a" />
          {/* Specular Gloss Sheen */}
          <path d="M13 16h38a7 7 0 017 7v6L13 24v-8z" fill="#ffffff" fillOpacity="0.3" />
          {/* 3D Avatar Profile */}
          <circle cx="32" cy="30" r="7.5" fill="#ffffff" />
          <path d="M20 48c0-5 5.5-9 12-9s12 4 12 9v1H20v-1z" fill="#ffffff" />
          {/* Chip / Card Lines */}
          <rect x="38" y="24" width="8" height="6" rx="1.5" fill="#fde047" fillOpacity="0.9" />
        </svg>
      ),
    },
    {
      id: "locations",
      name: "Địa điểm",
      path: "/dia-diem",
      category: "org",
      description: "Tòa nhà, văn phòng, kho bãi & chi nhánh",
      permission: "locations.view",
      renderIcon: () => (
        <svg viewBox="0 0 64 64" className="w-full h-full filter drop-shadow-[0_6px_12px_rgba(239,68,68,0.35)]">
          <defs>
            <radialGradient id="g3d_loc_shadow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#450a0a" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#450a0a" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="g3d_loc_body" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#f87171" />
              <stop offset="40%" stopColor="#ef4444" />
              <stop offset="85%" stopColor="#b91c1c" />
              <stop offset="100%" stopColor="#7f1d1d" />
            </radialGradient>
            <linearGradient id="g3d_loc_inner" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#fee2e2" />
            </linearGradient>
          </defs>
          {/* Realistic Contact Ripple & Shadow */}
          <ellipse cx="32" cy="56" rx="20" ry="5" fill="url(#g3d_loc_shadow)" />
          <ellipse cx="32" cy="55" rx="11" ry="3" stroke="#fca5a5" strokeWidth="1.5" fill="none" opacity="0.6" />
          {/* 3D Pin Depth Layer */}
          <path
            d="M32 8C20 8 10 18 10 30c0 15 22 26 22 26s22-11 22-26C54 18 44 8 32 8z"
            fill="#7f1d1d"
            transform="translate(0, 2.5)"
          />
          {/* 3D Pin Main Body */}
          <path
            d="M32 7C20 7 10 17 10 29c0 15 22 26 22 26s22-11 22-26C54 17 44 7 32 7z"
            fill="url(#g3d_loc_body)"
          />
          {/* Top Left Specular Gloss */}
          <path
            d="M16 22a16 16 0 0118-12c-4 1-8 4-10 8s-4 9-3 14c-3-3-5-6-5-10z"
            fill="#ffffff"
            fillOpacity="0.45"
          />
          {/* Central 3D Embossed White Orb */}
          <circle cx="32" cy="27" r="8.5" fill="#7f1d1d" opacity="0.3" transform="translate(0, 1.5)" />
          <circle cx="32" cy="27" r="8.5" fill="url(#g3d_loc_inner)" />
          <circle cx="32" cy="27" r="4.5" fill="#dc2626" />
          <circle cx="30.5" cy="25.5" r="1.5" fill="#ffffff" />
        </svg>
      ),
    },
    {
      id: "cost-centers",
      name: "Trung tâm chi phí",
      path: "/trung-tam-chi-phi",
      category: "org",
      description: "Theo dõi hạch toán chi phí đầu tư tài sản",
      permission: "cost-center.view",
      renderIcon: () => (
        <svg viewBox="0 0 64 64" className="w-full h-full filter drop-shadow-[0_6px_12px_rgba(217,119,6,0.35)]">
          <defs>
            <radialGradient id="g3d_cst_shadow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#451a03" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#451a03" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="g3d_cst_rim" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="50%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>
            <linearGradient id="g3d_cst_face" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="40%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
            <linearGradient id="g3d_cst_inner" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#92400e" />
            </linearGradient>
          </defs>
          <ellipse cx="32" cy="56" rx="21" ry="5" fill="url(#g3d_cst_shadow)" />
          {/* 3D Extruded Coin Edge */}
          <circle cx="32" cy="34" r="23" fill="#78350f" />
          {/* Outer Gold Ring */}
          <circle cx="32" cy="31" r="23" fill="url(#g3d_cst_rim)" />
          {/* Coin Face */}
          <circle cx="32" cy="31" r="19" fill="url(#g3d_cst_face)" />
          {/* Inner Beveled Groove */}
          <circle cx="32" cy="31" r="16.5" stroke="#92400e" strokeWidth="1.5" fill="url(#g3d_cst_inner)" opacity="0.6" />
          {/* Specular Crescent Gloss */}
          <path d="M14 26a19 19 0 0134-8c-4-4-13-6-20-4s-13 7-14 12z" fill="#ffffff" fillOpacity="0.5" />
          {/* 3D Embossed Percent Sign */}
          <path d="M22 39L42 23" stroke="#78350f" strokeWidth="5" strokeLinecap="round" transform="translate(0, 1.5)" opacity="0.5" />
          <path d="M22 39L42 23" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" />
          <circle cx="26" cy="25" r="4.5" fill="#ffffff" />
          <circle cx="26" cy="25" r="2" fill="#b45309" />
          <circle cx="38" cy="37" r="4.5" fill="#ffffff" />
          <circle cx="38" cy="37" r="2" fill="#b45309" />
        </svg>
      ),
    },

    // 4. Vận hành & Đối tác (Operations & Partners)
    {
      id: "maintenance",
      name: "Loại bảo trì",
      path: "/loai-bao-tri",
      category: "operation",
      badge: "Định kỳ",
      badgeColor: "bg-teal-500",
      description: "Bảo trì sửa chữa, kiểm định định kỳ thiết bị",
      permission: "maintenance-type.view",
      renderIcon: () => (
        <svg viewBox="0 0 64 64" className="w-full h-full filter drop-shadow-[0_6px_10px_rgba(13,148,136,0.3)]">
          <defs>
            <radialGradient id="g3d_mnt_shadow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#042f2e" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#042f2e" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="g3d_mnt_wrench" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#5eead4" />
              <stop offset="50%" stopColor="#0d9488" />
              <stop offset="100%" stopColor="#115e59" />
            </linearGradient>
            <linearGradient id="g3d_mnt_gear" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
          </defs>
          <ellipse cx="32" cy="56" rx="20" ry="4.5" fill="url(#g3d_mnt_shadow)" />
          {/* 3D Gear in background */}
          <circle cx="26" cy="26" r="14" fill="url(#g3d_mnt_gear)" />
          <circle cx="26" cy="26" r="6" fill="#1e293b" />
          {/* 3D Wrench Depth */}
          <path
            d="M44 14a8 8 0 00-9 2l-15 15a4 4 0 000 5.6l2.8 2.8a4 4 0 005.6 0l15-15a8 8 0 005.6-10.4l-2.8 2.8-4.2-4.2 2.8-2.8c-1.4-.5-3.2-.8-4.8-.8z"
            fill="#042f2e"
            transform="translate(0, 3)"
          />
          {/* 3D Wrench Front */}
          <path
            d="M44 12a8 8 0 00-9 2l-15 15a4 4 0 000 5.6l2.8 2.8a4 4 0 005.6 0l15-15a8 8 0 005.6-10.4l-2.8 2.8-4.2-4.2 2.8-2.8c-1.4-.5-3.2-.8-4.8-.8z"
            fill="url(#g3d_mnt_wrench)"
          />
          {/* Bevel Highlights */}
          <path d="M22 34l15-15" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
          <circle cx="48" cy="18" r="3" fill="#ccfbf1" />
        </svg>
      ),
    },
    {
      id: "licenses",
      name: "Loại giấy phép",
      path: "/loai-giay-phep",
      category: "operation",
      description: "Bản quyền phần mềm, License key & thời hạn",
      permission: "license-type.view",
      renderIcon: () => (
        <svg viewBox="0 0 64 64" className="w-full h-full filter drop-shadow-[0_6px_10px_rgba(147,51,234,0.3)]">
          <defs>
            <radialGradient id="g3d_lic_shadow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#3b0764" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#3b0764" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="g3d_lic_body" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="50%" stopColor="#9333ea" />
              <stop offset="100%" stopColor="#6b21a8" />
            </linearGradient>
            <linearGradient id="g3d_lic_gold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
          </defs>
          <ellipse cx="32" cy="56" rx="20" ry="4.5" fill="url(#g3d_lic_shadow)" />
          {/* 3D Certificate Plaque */}
          <rect x="10" y="11" width="44" height="38" rx="8" fill="#581c87" />
          <rect x="10" y="9" width="44" height="38" rx="8" fill="url(#g3d_lic_body)" />
          <path d="M12 11h40a6 6 0 016 6v4L12 18v-7z" fill="#ffffff" fillOpacity="0.3" />
          {/* Security Ribbon */}
          <path d="M22 9v18l5-3 5 3V9z" fill="#ef4444" />
          {/* 3D Floating Gold Key */}
          <circle cx="36" cy="30" r="9" fill="#78350f" transform="translate(0, 2)" />
          <circle cx="36" cy="30" r="9" fill="url(#g3d_lic_gold)" />
          <circle cx="36" cy="30" r="4.5" fill="#581c87" />
          <path d="M42 36l10 10m-3-1l3 3m-1-5l3 3" stroke="url(#g3d_lic_gold)" strokeWidth="4" strokeLinecap="round" />
          {/* Sparkle */}
          <circle cx="34" cy="27" r="1.5" fill="#ffffff" />
        </svg>
      ),
    },
    {
      id: "suppliers",
      name: "Nhà cung cấp",
      path: "/nha-cung-cap",
      category: "operation",
      description: "Đối tác bán buôn, cung cấp linh kiện & dịch vụ",
      permission: "suppliers.view",
      renderIcon: () => (
        <svg viewBox="0 0 64 64" className="w-full h-full filter drop-shadow-[0_6px_10px_rgba(37,99,235,0.3)]">
          <defs>
            <radialGradient id="g3d_sup_shadow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0f172a" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="g3d_sup_box" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="60%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
            <linearGradient id="g3d_sup_cab" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#93c5fd" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
          <ellipse cx="32" cy="56" rx="23" ry="4.5" fill="url(#g3d_sup_shadow)" />
          {/* Cargo Container 3D */}
          <rect x="7" y="15" width="34" height="28" rx="4" fill="#1e3a8a" transform="translate(0, 2)" />
          <rect x="7" y="14" width="34" height="28" rx="4" fill="url(#g3d_sup_box)" />
          {/* Cargo Horizontal Grooves */}
          <rect x="9" y="19" width="30" height="2" fill="#1e40af" />
          <rect x="9" y="27" width="30" height="2" fill="#1e40af" />
          <rect x="9" y="35" width="30" height="2" fill="#1e40af" />
          {/* Truck Cab */}
          <path d="M41 24h10l5 9v11H41V24z" fill="url(#g3d_sup_cab)" />
          {/* Windshield */}
          <path d="M44 26h6l3 6h-9v-6z" fill="#0f172a" />
          <path d="M44 26h6l3 6h-9v-6z" fill="#38bdf8" fillOpacity="0.7" />
          {/* 3D Wheels */}
          <circle cx="17" cy="46" r="6.5" fill="#1e293b" />
          <circle cx="17" cy="46" r="3.5" fill="#94a3b8" />
          <circle cx="17" cy="46" r="1.5" fill="#ffffff" />
          <circle cx="47" cy="46" r="6.5" fill="#1e293b" />
          <circle cx="47" cy="46" r="3.5" fill="#94a3b8" />
          <circle cx="47" cy="46" r="1.5" fill="#ffffff" />
          {/* Headlight */}
          <rect x="54" y="37" width="2.5" height="4" rx="1" fill="#fde047" />
        </svg>
      ),
    },
    {
      id: "units",
      name: "Đơn vị tính",
      path: "/don-vi",
      category: "lookup",
      description: "Cái, bộ, chiếc, thiết bị, gói bản quyền",
      permission: "units.view",
      renderIcon: () => (
        <svg viewBox="0 0 64 64" className="w-full h-full filter drop-shadow-[0_6px_10px_rgba(234,88,12,0.3)]">
          <defs>
            <radialGradient id="g3d_unt_shadow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#7c2d12" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#7c2d12" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="g3d_unt_body" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fb923c" />
              <stop offset="60%" stopColor="#ea580c" />
              <stop offset="100%" stopColor="#9a3412" />
            </linearGradient>
          </defs>
          <ellipse cx="32" cy="56" rx="21" ry="4.5" fill="url(#g3d_unt_shadow)" />
          {/* 3D Precision Ruler Block */}
          <rect x="8" y="16" width="48" height="34" rx="7" fill="#7c2d12" />
          <rect x="8" y="14" width="48" height="34" rx="7" fill="url(#g3d_unt_body)" />
          {/* Specular Highlight */}
          <path d="M10 16h44a5 5 0 015 5v3L10 22v-6z" fill="#ffffff" fillOpacity="0.35" />
          {/* Measurement Scale Bar */}
          <rect x="12" y="24" width="40" height="12" rx="3" fill="#ffffff" fillOpacity="0.9" />
          {/* Measurement Tick Marks */}
          <path d="M16 24v7M21 24v4M26 24v5M31 24v4M36 24v7M41 24v4M46 24v5M50 24v4" stroke="#c2410c" strokeWidth="2" strokeLinecap="round" />
          {/* Unit Dimension Markers */}
          <circle cx="20" cy="42" r="2.5" fill="#fed7aa" />
          <circle cx="32" cy="42" r="2.5" fill="#fed7aa" />
          <circle cx="44" cy="42" r="2.5" fill="#fed7aa" />
        </svg>
      ),
    },
    // 4. Vận hành & Cảnh báo (Operations & Alerts)
    {
      id: "notifications",
      name: "Thông báo & Cảnh báo",
      path: "/thong-bao",
      category: "operation",
      badge: "Alerts",
      badgeColor: "bg-amber-500",
      description: "Trung tâm quản lý thông báo, cảnh báo tài nguyên hệ thống (RAM, Disk, Offline)",
      renderIcon: () => (
        <svg viewBox="0 0 64 64" className="w-full h-full filter drop-shadow-[0_6px_12px_rgba(245,158,11,0.32)]">
          <defs>
            <radialGradient id="g3d_notif_shadow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#78350f" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#78350f" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="g3d_notif_body" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <linearGradient id="g3d_notif_rim" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef3c7" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <linearGradient id="g3d_notif_clapper" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>
            <linearGradient id="g3d_notif_pulse" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#e11d48" />
            </linearGradient>
          </defs>
          <ellipse cx="32" cy="56" rx="22" ry="5" fill="url(#g3d_notif_shadow)" />
          <ellipse cx="32" cy="11" rx="5" ry="3.5" fill="#b45309" />
          <ellipse cx="32" cy="10" rx="5" ry="3.5" fill="#fcd34d" />
          <ellipse cx="32" cy="10" rx="2.5" ry="1.8" fill="#78350f" />
          <circle cx="32" cy="48" r="5" fill="url(#g3d_notif_clapper)" />
          <circle cx="32.5" cy="47.5" r="3.5" fill="#d97706" />
          <path
            d="M32 14c-8 0-14 6-14 16v11c-3 1.5-6 3.5-6 6h40c0-2.5-3-4.5-6-6V30c0-10-6-16-14-16z"
            fill="#b45309"
            transform="translate(0, 2)"
          />
          <path
            d="M32 14c-8 0-14 6-14 16v11c-3 1.5-6 3.5-6 6h40c0-2.5-3-4.5-6-6V30c0-10-6-16-14-16z"
            fill="url(#g3d_notif_body)"
          />
          <path
            d="M12 47c0-2.5 3-4.5 6-6h28c3 1.5 6 3.5 6 6 0 2-4 3.5-8 3.5H20c-4 0-8-1.5-8-3.5z"
            fill="url(#g3d_notif_rim)"
          />
          <path
            d="M24 18c-4 3-7 8-7 14v10c0 1-1 2-2 3 0-8 3-15 9-19v-8z"
            fill="#ffffff"
            fillOpacity="0.45"
          />
          <ellipse cx="28" cy="22" rx="3" ry="1.5" fill="#ffffff" fillOpacity="0.6" transform="rotate(-30 28 22)" />
          <path d="M7 25c-2.5 3-4 6.5-4 10.5s1.5 7.5 4 10.5" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.85" />
          <path d="M57 25c2.5 3 4 6.5 4 10.5s-1.5 7.5-4 10.5" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.85" />
          <circle cx="46" cy="15" r="5.5" fill="url(#g3d_notif_pulse)" />
          <circle cx="46" cy="15" r="2.5" fill="#ffffff" />
          <circle cx="46" cy="15" r="7" stroke="#f43f5e" strokeWidth="1" opacity="0.4" fill="none" />
        </svg>
      ),
    },
    {
      id: "actionable-tasks",
      name: "Công việc cần xử lý",
      path: "/cong-viec-xu-ly",
      category: "operation",
      badge: "Action",
      badgeColor: "bg-rose-500",
      description: "Danh sách nhiệm vụ vận hành, dọn dẹp máy trạm quá tải và xử lý vi phạm license",
      renderIcon: () => (
        <svg viewBox="0 0 64 64" className="w-full h-full filter drop-shadow-[0_6px_12px_rgba(244,63,94,0.32)]">
          <defs>
            <radialGradient id="g3d_tsk_shadow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#4c0519" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#4c0519" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="g3d_tsk_outer" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fb7185" />
              <stop offset="50%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#be123c" />
            </linearGradient>
            <linearGradient id="g3d_tsk_inner" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f1f5f9" />
            </linearGradient>
            <linearGradient id="g3d_tsk_check" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>
          <ellipse cx="32" cy="56" rx="22" ry="5" fill="url(#g3d_tsk_shadow)" />
          <path d="M29 6h6v4h-6z" fill="#9f1239" />
          <path d="M28 4h8v3h-8z" fill="#fda4af" />
          <rect x="15" y="11" width="4" height="4" rx="1" fill="#be123c" transform="rotate(-35 17 13)" />
          <rect x="45" y="11" width="4" height="4" rx="1" fill="#be123c" transform="rotate(35 47 13)" />
          <circle cx="32" cy="34" r="22" fill="#881337" />
          <circle cx="32" cy="32" r="22" fill="url(#g3d_tsk_outer)" />
          <circle cx="32" cy="32" r="17" fill="url(#g3d_tsk_inner)" />
          <circle cx="32" cy="18" r="1.5" fill="#f43f5e" />
          <circle cx="46" cy="32" r="1.5" fill="#94a3b8" />
          <circle cx="32" cy="46" r="1.5" fill="#94a3b8" />
          <circle cx="18" cy="32" r="1.5" fill="#94a3b8" />
          <path d="M32 32l6-8" stroke="#e11d48" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M32 32l-5 4" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="32" cy="32" r="2.5" fill="#881337" />
          <circle cx="32" cy="32" r="1.2" fill="#ffffff" />
          <path d="M20 20a17 17 0 0124 0l-12 12z" fill="#ffffff" fillOpacity="0.25" />
          <circle cx="44" cy="43" r="8.5" fill="#065f46" />
          <circle cx="44" cy="42" r="8" fill="url(#g3d_tsk_check)" />
          <path d="M40.5 42l2.5 2.5 5-5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      ),
    },
    {
      id: "contracts",
      name: "Hợp đồng & Bảo hành",
      path: "/hop-dong-bao-hanh",
      category: "operation",
      description: "Quản lý hồ sơ hợp đồng mua sắm & cam kết SLA",
      permission: "contracts.view",
      renderIcon: () => (
        <svg viewBox="0 0 64 64" className="w-full h-full filter drop-shadow-[0_6px_10px_rgba(5,150,105,0.3)]">
          <defs>
            <radialGradient id="g3d_con_shadow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#064e3b" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#064e3b" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="g3d_con_page" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ecfdf5" />
              <stop offset="100%" stopColor="#d1fae5" />
            </linearGradient>
            <linearGradient id="g3d_con_header" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>
          <ellipse cx="32" cy="56" rx="20" ry="4.5" fill="url(#g3d_con_shadow)" />
          {/* 3D Folder / Paper Back */}
          <rect x="11" y="9" width="42" height="46" rx="6" fill="#047857" />
          {/* Paper Sheet */}
          <rect x="11" y="7" width="42" height="46" rx="6" fill="url(#g3d_con_page)" />
          {/* Top Certificate Banner */}
          <path d="M11 13a6 6 0 016-6h30a6 6 0 016 6v8H11v-8z" fill="url(#g3d_con_header)" />
          {/* Text Rows */}
          <rect x="18" y="27" width="28" height="2.5" rx="1" fill="#6ee7b7" />
          <rect x="18" y="32" width="22" height="2.5" rx="1" fill="#9ca3af" />
          <rect x="18" y="37" width="26" height="2.5" rx="1" fill="#9ca3af" />
          {/* 3D Wax Seal Badge in bottom right */}
          <circle cx="42" cy="44" r="8" fill="#991b1b" transform="translate(0, 1.5)" />
          <circle cx="42" cy="44" r="8" fill="#ef4444" />
          <circle cx="42" cy="44" r="5" fill="#dc2626" />
          <path d="M40 44l1.5 1.5 3-3" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      ),
    },

    // 5. Báo cáo & Hệ thống (Reports & System)
    {
      id: "reports",
      name: "Báo cáo & Thống kê",
      path: "/bao-cao-thong-ke",
      category: "operation",
      badge: "Xu hướng",
      badgeColor: "bg-purple-600",
      description: "Biểu đồ chi phí, khấu hao tài sản và biến động",
      permission: "reports.view",
      renderIcon: () => (
        <svg viewBox="0 0 64 64" className="w-full h-full filter drop-shadow-[0_6px_10px_rgba(168,85,247,0.3)]">
          <defs>
            <radialGradient id="g3d_rep_shadow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#3b0764" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#3b0764" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="g3d_rep_col1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>
            <linearGradient id="g3d_rep_col2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#7e22ce" />
            </linearGradient>
            <linearGradient id="g3d_rep_col3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f472b6" />
              <stop offset="100%" stopColor="#db2777" />
            </linearGradient>
          </defs>
          <ellipse cx="32" cy="56" rx="22" ry="4.5" fill="url(#g3d_rep_shadow)" />
          {/* 3D Base Platform */}
          <path d="M8 50l24 6 24-6-24-6z" fill="#475569" />
          {/* Column 1 (Short) */}
          <rect x="13" y="34" width="9" height="18" rx="2" fill="url(#g3d_rep_col1)" />
          <ellipse cx="17.5" cy="34" rx="4.5" ry="2" fill="#a5b4fc" />
          {/* Column 2 (Medium) */}
          <rect x="27" y="24" width="9" height="28" rx="2" fill="url(#g3d_rep_col2)" />
          <ellipse cx="31.5" cy="24" rx="4.5" ry="2" fill="#e9d5ff" />
          {/* Column 3 (Tall) */}
          <rect x="41" y="14" width="9" height="38" rx="2" fill="url(#g3d_rep_col3)" />
          <ellipse cx="45.5" cy="14" rx="4.5" ry="2" fill="#fbcfe8" />
          {/* 3D Upward Trend Line */}
          <path d="M16 30l15-11 15-8" stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <polygon points="49,11 43,10 47,15" fill="#38bdf8" />
          <circle cx="16" cy="30" r="2.5" fill="#ffffff" />
          <circle cx="31" cy="19" r="2.5" fill="#ffffff" />
          <circle cx="46" cy="11" r="2.5" fill="#ffffff" />
        </svg>
      ),
    },
    {
      id: "system-logs",
      name: "Nhật ký hệ thống",
      path: "/nhat-ky-he-thong",
      category: "system",
      description: "Lịch sử thao tác, kiểm toán bảo mật & audit trail",
      permission: "audit.view",
      renderIcon: () => (
        <svg viewBox="0 0 64 64" className="w-full h-full filter drop-shadow-[0_6px_10px_rgba(51,65,85,0.35)]">
          <defs>
            <radialGradient id="g3d_log_shadow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0f172a" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="g3d_log_body" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
          </defs>
          <ellipse cx="32" cy="56" rx="21" ry="4.5" fill="url(#g3d_log_shadow)" />
          {/* 3D Depth Layer */}
          <rect x="8" y="12" width="48" height="40" rx="8" fill="#0f172a" />
          <rect x="8" y="10" width="48" height="40" rx="8" fill="url(#g3d_log_body)" />
          {/* Terminal Title Bar */}
          <rect x="8" y="10" width="48" height="9" rx="8" fill="#334155" />
          <circle cx="15" cy="14.5" r="2" fill="#ef4444" />
          <circle cx="21" cy="14.5" r="2" fill="#f59e0b" />
          <circle cx="27" cy="14.5" r="2" fill="#10b981" />
          {/* Glowing Terminal Screen Content */}
          <path d="M15 25l5 4-5 4" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <line x1="25" y1="29" x2="35" y2="29" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
          <rect x="15" y="37" width="28" height="2.5" rx="1.25" fill="#94a3b8" opacity="0.6" />
          <rect x="15" y="42" width="18" height="2.5" rx="1.25" fill="#a7f3d0" opacity="0.8" />
        </svg>
      ),
    },
    {
      id: "calendar",
      name: "Lịch bảo trì",
      path: "/lich-bao-tri",
      category: "operation",
      description: "Kế hoạch bảo hành, kiểm tra tài sản hàng tháng",
      permission: "maintenance.view",
      renderIcon: () => (
        <svg viewBox="0 0 64 64" className="w-full h-full filter drop-shadow-[0_6px_10px_rgba(239,68,68,0.3)]">
          <defs>
            <radialGradient id="g3d_cal_shadow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#450a0a" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#450a0a" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="g3d_cal_head" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f87171" />
              <stop offset="50%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#b91c1c" />
            </linearGradient>
          </defs>
          <ellipse cx="32" cy="56" rx="21" ry="4.5" fill="url(#g3d_cal_shadow)" />
          {/* 3D Page Stack */}
          <rect x="8" y="16" width="48" height="38" rx="8" fill="#94a3b8" />
          <rect x="8" y="14" width="48" height="38" rx="8" fill="#ffffff" />
          {/* Red Top Binder */}
          <path d="M8 22a8 8 0 018-8h32a8 8 0 018 8v6H8v-6z" fill="url(#g3d_cal_head)" />
          <path d="M10 16h44" stroke="#ffffff" strokeWidth="1.5" opacity="0.4" />
          {/* Spiral Chrome Rings */}
          <rect x="18" y="9" width="4" height="10" rx="2" fill="#e2e8f0" />
          <rect x="30" y="9" width="4" height="10" rx="2" fill="#e2e8f0" />
          <rect x="42" y="9" width="4" height="10" rx="2" fill="#e2e8f0" />
          {/* Calendar Date 31 */}
          <text x="32" y="45" textAnchor="middle" fontSize="20" fontWeight="900" fill="#1e293b" fontFamily="system-ui, sans-serif">
            31
          </text>
          {/* Mini accent dot */}
          <circle cx="44" cy="35" r="2.5" fill="#10b981" />
        </svg>
      ),
    },
    {
      id: "users",
      name: "Tài khoản người dùng",
      path: "/tai-khoan",
      category: "system",
      description: "Danh sách người dùng, cán bộ quản lý tài sản",
      permission: "accounts.view",
      renderIcon: () => (
        <svg viewBox="0 0 64 64" className="w-full h-full filter drop-shadow-[0_6px_10px_rgba(99,102,241,0.3)]">
          <defs>
            <radialGradient id="g3d_usr_shadow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1e1b4b" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="g3d_usr_head1" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#a5b4fc" />
              <stop offset="50%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#4338ca" />
            </radialGradient>
            <radialGradient id="g3d_usr_head2" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="50%" stopColor="#9333ea" />
              <stop offset="100%" stopColor="#581c87" />
            </radialGradient>
          </defs>
          <ellipse cx="32" cy="56" rx="22" ry="4.5" fill="url(#g3d_usr_shadow)" />
          {/* Secondary User (Back) */}
          <circle cx="42" cy="22" r="10" fill="url(#g3d_usr_head2)" />
          <path d="M30 48c0-6 5.5-11 12-11s12 5 12 11v3H30v-3z" fill="#7e22ce" />
          {/* Primary User (Front) */}
          <circle cx="25" cy="25" r="12" fill="url(#g3d_usr_head1)" />
          <ellipse cx="21" cy="19" rx="5" ry="2.5" fill="#ffffff" fillOpacity="0.5" transform="rotate(-20 21 19)" />
          <path d="M10 52c0-8 7-14 15-14s15 6 15 14v2H10v-2z" fill="#4338ca" />
          <path d="M10 50c0-7 7-12 15-12s15 5 15 12v2H10v-2z" fill="#4f46e5" />
        </svg>
      ),
    },
    {
      id: "permissions",
      name: "Phân quyền",
      path: "/phan-quyen",
      category: "system",
      description: "Phân quyền theo vai trò & quyền hạn truy cập",
      permission: "roles.view",
      renderIcon: () => (
        <svg viewBox="0 0 64 64" className="w-full h-full filter drop-shadow-[0_6px_10px_rgba(245,158,11,0.35)]">
          <defs>
            <radialGradient id="g3d_prm_shadow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#451a03" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#451a03" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="g3d_prm_shield" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="35%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
            <linearGradient id="g3d_prm_steel" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>
          </defs>
          <ellipse cx="32" cy="56" rx="20" ry="4.5" fill="url(#g3d_prm_shadow)" />
          {/* 3D Shield Base Depth */}
          <path
            d="M32 7l18 7v16c0 14-9 22-18 25-9-3-18-11-18-25V14l18-7z"
            fill="#78350f"
            transform="translate(0, 2.5)"
          />
          {/* 3D Shield */}
          <path
            d="M32 6l18 7v16c0 14-9 22-18 25-9-3-18-11-18-25V13l18-7z"
            fill="url(#g3d_prm_shield)"
          />
          {/* Specular Left Sheen */}
          <path d="M32 8L16 14v15c0 11 7 18 16 21V8z" fill="#ffffff" fillOpacity="0.25" />
          {/* Padlock Shackle */}
          <path d="M26 28v-6a6 6 0 0112 0v6" stroke="url(#g3d_prm_steel)" strokeWidth="4" strokeLinecap="round" fill="none" />
          {/* Padlock Body 3D */}
          <rect x="23" y="27" width="18" height="15" rx="4" fill="#78350f" transform="translate(0, 1.5)" />
          <rect x="23" y="26" width="18" height="15" rx="4" fill="#ffffff" />
          <circle cx="32" cy="32" r="2.5" fill="#78350f" />
          <path d="M32 34.5v3" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: "settings",
      name: "Cấu hình hệ thống",
      path: "/cau-hinh-he-thong",
      category: "system",
      description: "Thiết lập tham số chung, mẫu in ấn & thông báo",
      permission: "settings.view",
      renderIcon: () => (
        <svg viewBox="0 0 64 64" className="w-full h-full filter drop-shadow-[0_6px_10px_rgba(71,85,105,0.3)]">
          <defs>
            <radialGradient id="g3d_set_shadow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0f172a" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="g3d_set_gear1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#94a3b8" />
              <stop offset="50%" stopColor="#64748b" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>
            <linearGradient id="g3d_set_gear2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
          </defs>
          <ellipse cx="32" cy="56" rx="21" ry="4.5" fill="url(#g3d_set_shadow)" />
          {/* Big Gear 3D Depth */}
          <circle cx="30" cy="33" r="19" fill="#1e293b" />
          {/* Big Gear Body */}
          <circle cx="30" cy="30" r="19" fill="url(#g3d_set_gear1)" />
          {/* Cog Teeth */}
          <path
            d="M30 7v6M30 47v6M7 30h6M47 30h6M14 14l4 4M42 42l4 4M14 46l4-4M42 18l4-4"
            stroke="url(#g3d_set_gear1)"
            strokeWidth="6"
            strokeLinecap="round"
          />
          {/* Gear Inner Core */}
          <circle cx="30" cy="30" r="8" fill="#1e293b" />
          <circle cx="30" cy="30" r="5" fill="#f8fafc" />
          {/* Smaller Accent Gear */}
          <circle cx="46" cy="44" r="10" fill="url(#g3d_set_gear2)" />
          <circle cx="46" cy="44" r="4" fill="#0c4a6e" />
          {/* Specular Sheen */}
          <path d="M16 23a16 16 0 0123-7" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
        </svg>
      ),
    },
  ];

  // Lọc danh sách module theo quyền hạn (RBAC) của người dùng
  const visibleModules = useMemo(() => {
    return appModules.filter((mod) => !mod.permission || hasPermission(mod.permission));
  }, [appModules, hasPermission]);

  // Filtering by search term and category
  const filteredModules = useMemo(() => {
    return visibleModules.filter((mod) => {
      const matchSearch =
        mod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mod.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat =
        selectedCategory === "all" || mod.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [visibleModules, searchTerm, selectedCategory]);

  const allCategories = [
    { id: "all", label: "Tất cả ứng dụng" },
    { id: "asset", label: "Tài sản IT" },
    { id: "org", label: "Tổ chức & Địa điểm" },
    { id: "lookup", label: "Danh mục hệ thống" },
    { id: "operation", label: "Vận hành & Bảo trì" },
    { id: "system", label: "Quản trị" },
  ];

  // Chỉ hiển thị các tab danh mục có ít nhất 1 module người dùng có quyền truy cập
  const categories = useMemo(() => {
    return allCategories.filter((cat) => {
      if (cat.id === "all") return true;
      return visibleModules.some((m) => m.category === cat.id);
    });
  }, [visibleModules]);

  return (
    <>
      <PageMeta
        title="Trang chủ Ứng dụng | AIMS Asset Information Management System"
        description="Màn hình ứng dụng trung tâm điều phối tài sản số và hệ thống quản trị AIMS"
      />

      <div className="relative flex-1 w-full">
        {/* Subtle diagonal ambient light beam (Signature AIMS angled sheen) */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-[40%] -left-[20%] w-[140%] h-[140%] bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-white/40 via-transparent to-transparent dark:from-indigo-500/10 dark:via-transparent dark:to-transparent opacity-70" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-300/20 dark:bg-purple-900/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-blue-300/20 dark:bg-blue-900/15 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* MAIN BODY: APP LAUNCHER GRID */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">

          {/* Category Filter Tabs */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 overflow-x-auto py-2 mb-8 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${selectedCategory === cat.id
                  ? "bg-white dark:bg-gray-800 text-brand-600 dark:text-brand-400 shadow-md shadow-black/5 border border-brand-200/50 dark:border-brand-800/50 font-semibold"
                  : "text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50"
                  }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Result Counter (if searching) */}
          {searchTerm && (
            <div className="flex items-center justify-between mb-6 px-4 py-2 rounded-xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 text-xs text-gray-600 dark:text-gray-300">
              <span>
                Tìm thấy <strong>{filteredModules.length}</strong> chức năng cho từ khóa &quot;{searchTerm}&quot;
              </span>
              <button
                onClick={clearSearch}
                className="text-brand-600 dark:text-brand-400 hover:underline font-medium cursor-pointer"
              >
                Xóa bộ lọc
              </button>
            </div>
          )}

          {/* Empty state when no apps match */}
          {filteredModules.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 mb-4 rounded-2xl bg-white/60 dark:bg-gray-800/60 flex items-center justify-center text-gray-400 shadow-xs">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-1">
                Không tìm thấy chức năng phù hợp
              </h3>
              <p className="text-xs text-gray-500 max-w-sm mb-4">
                Không có ứng dụng nào khớp với &quot;{searchTerm}&quot;. Vui lòng thử tìm với từ khóa khác như &quot;tài sản&quot;, &quot;phòng ban&quot;, &quot;bảo trì&quot;.
              </p>
              <button
                onClick={() => {
                  clearSearch();
                  setSelectedCategory("all");
                }}
                className="px-4 py-2 text-xs font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 shadow-sm transition-all cursor-pointer"
              >
                Hiển thị tất cả ứng dụng
              </button>
            </div>
          ) : (
            /* AIMS App Launcher Grid (6 columns desktop, 4 tablet, 3 mobile) */
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-x-4 sm:gap-x-6 md:gap-x-8 gap-y-7 sm:gap-y-9 justify-items-center">
              {filteredModules.map((app) => (
                <Link
                  key={app.id}
                  to={app.path}
                  className="group flex flex-col items-center text-center cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-2xl p-1.5 transition-all"
                  title={app.description}
                >
                  {/* Floating 3D Icon Container without square bounding box */}
                  <div className="relative">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-[72px] md:h-[72px] flex items-center justify-center transition-transform duration-300 ease-out group-hover:-translate-y-2 group-hover:scale-110 group-active:scale-95">
                      {app.renderIcon()}
                    </div>

                    {/* Badge if present */}
                    {app.badge && (
                      <span
                        className={`absolute -top-1 -right-2 px-1.5 py-0.5 text-[9px] font-bold text-white rounded-full shadow-sm ring-2 ring-white dark:ring-gray-900 ${app.badgeColor || "bg-brand-500"
                          }`}
                      >
                        {app.badge}
                      </span>
                    )}
                  </div>

                  {/* App Title Label */}
                  <span className="mt-2.5 text-xs sm:text-[13px] font-medium text-gray-700 dark:text-gray-200 max-w-[105px] tracking-tight leading-snug line-clamp-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 group-hover:font-semibold transition-all">
                    {app.name}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
