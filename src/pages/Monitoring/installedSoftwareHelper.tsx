/* eslint-disable react-refresh/only-export-components */
import React from "react";
import {
  SoftwareCategory,
  SoftwareComplianceStatus,
  SoftwareLicenseType,
} from "../../models/Monitoring/installedSoftware";

export const CATEGORY_META: Record<
  SoftwareCategory,
  { label: string; icon: string; color: string }
> = {
  Office: {
    label: "Văn phòng & Soạn thảo",
    icon: "📄",
    color: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-900/40",
  },
  Development: {
    label: "Lập trình & Kỹ thuật",
    icon: "💻",
    color: "bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200 dark:border-purple-900/40",
  },
  Security: {
    label: "Bảo mật & Diệt virus",
    icon: "🛡️",
    color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/40",
  },
  System: {
    label: "Hệ thống & Driver",
    icon: "⚙️",
    color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700",
  },
  Utility: {
    label: "Tiện ích & Công cụ",
    icon: "🔧",
    color: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-900/40",
  },
  Design: {
    label: "Đồ họa & Thiết kế",
    icon: "🎨",
    color: "bg-pink-50 text-pink-700 dark:bg-pink-950/50 dark:text-pink-300 border-pink-200 dark:border-pink-900/40",
  },
  Communication: {
    label: "Hội thoại & Trao đổi",
    icon: "💬",
    color: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300 border-cyan-200 dark:border-cyan-900/40",
  },
  Other: {
    label: "Khác",
    icon: "📦",
    color: "bg-gray-50 text-gray-600 dark:bg-gray-800/60 dark:text-gray-400 border-gray-200 dark:border-gray-800",
  },
};

export const COMPLIANCE_STATUS_META: Record<
  SoftwareComplianceStatus,
  { label: string; badgeClass: string; icon: string; description: string }
> = {
  Approved: {
    label: "Đã phê duyệt",
    badgeClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/50",
    icon: "✓",
    description: "Phần mềm được phòng CNTT chấp thuận cài đặt theo chính sách công ty.",
  },
  UnderReview: {
    label: "Cần rà soát",
    badgeClass: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/50",
    icon: "⚠️",
    description: "Phần mềm mới phát hiện, đang chờ IT thẩm định bảo mật hoặc giấy phép.",
  },
  Prohibited: {
    label: "Nghiêm cấm / Rủi ro",
    badgeClass: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/50",
    icon: "⛔",
    description: "Vi phạm chính sách an ninh mạng (Shadow IT, Torrent, ứng dụng nguy hại).",
  },
  Unlicensed: {
    label: "Chưa kích hoạt bản quyền",
    badgeClass: "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/50",
    icon: "🔑",
    description: "Phần mềm thương mại nhưng chưa tìm thấy chứng nhận bản quyền hợp lệ.",
  },
};

export const LICENSE_TYPE_META: Record<
  SoftwareLicenseType,
  { label: string; badgeClass: string }
> = {
  Commercial: {
    label: "Bản quyền vĩnh viễn (Commercial)",
    badgeClass: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-900/40",
  },
  "Free / OpenSource": {
    label: "Miễn phí / Mã nguồn mở",
    badgeClass: "bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-900/40",
  },
  Subscription: {
    label: "Thuê bao định kỳ (Subscription)",
    badgeClass: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900/40",
  },
  Unlicensed: {
    label: "Chưa đăng ký",
    badgeClass: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-900/40",
  },
  Unknown: {
    label: "Chưa xác định",
    badgeClass: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700",
  },
};

export const formatSizeMB = (mb: number): string => {
  if (mb >= 1024) {
    return `${(mb / 1024).toFixed(2)} GB`;
  }
  return `${mb.toLocaleString()} MB`;
};

export const SoftwareComplianceBadge: React.FC<{ status: SoftwareComplianceStatus }> = ({
  status,
}) => {
  const meta = COMPLIANCE_STATUS_META[status] || COMPLIANCE_STATUS_META.UnderReview;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${meta.badgeClass}`}
      title={meta.description}
    >
      <span>{meta.icon}</span>
      <span>{meta.label}</span>
    </span>
  );
};
