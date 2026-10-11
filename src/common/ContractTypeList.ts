// Danh sách loại hợp đồng chuẩn CNTT
export const contractTypeList = [
  {
    value: "SERVICE_MAINTENANCE",
    label: "🛠️ Bảo trì & Dịch vụ / Service Maintenance",
  },
  {
    value: "IT_HARDWARE",
    label: "🖥️ Mua sắm Thiết bị phần cứng CNTT",
  },
  {
    value: "DESKTOP_PC",
    label: "🖥️ Máy tính để bàn / Desktop",
  },
  {
    value: "LAPTOP",
    label: "💻 Máy tính xách tay / Laptop",
  },
  {
    value: "WORKSTATION",
    label: "🧑‍💻 Máy trạm chuyên dụng / Workstation",
  },
  {
    value: "SERVER",
    label: "🗄️ Máy chủ / Server",
  },
  {
    value: "STORAGE",
    label: "💾 Thiết bị lưu trữ / Storage",
  },
  {
    value: "BACKUP_DEVICE",
    label: "📦 Thiết bị Backup & lưu trữ dự phòng",
  },
  {
    value: "PRINTER_SCANNER",
    label: "🖨️ Máy in, Scan & Thiết bị văn phòng",
  },
  {
    value: "PERIPHERALS",
    label: "⌨️ Thiết bị ngoại vi & phụ kiện CNTT",
  },
  {
    value: "UPS_POWER",
    label: "🔋 UPS, PDU & Thiết bị nguồn CNTT",
  },

  // =========================================================
  // 🌐 NETWORK & TELECOM
  // =========================================================
  {
    value: "NETWORK_EQUIPMENT",
    label: "🌐 Thiết bị mạng / Network Equipment",
  },
  {
    value: "SWITCH",
    label: "🔀 Switch & Thiết bị chuyển mạch",
  },
  {
    value: "ROUTER",
    label: "📡 Router & Thiết bị định tuyến",
  },
  {
    value: "WIFI",
    label: "📶 Wi-Fi & Wireless Network",
  },
  {
    value: "FIREWALL",
    label: "🔥 Firewall & Network Security Appliance",
  },
  {
    value: "INTERNET_TELECOM",
    label: "🌐 Kênh truyền Internet & Leased Line",
  },
  {
    value: "MPLS",
    label: "🔗 MPLS & Kết nối mạng doanh nghiệp",
  },
  {
    value: "VPN",
    label: "🔐 VPN & Kết nối mạng riêng",
  },
  {
    value: "MOBILE_TELECOM",
    label: "📱 Dịch vụ Viễn thông & Di động",
  },
  {
    value: "SMS_SERVICE",
    label: "💬 Dịch vụ SMS Brandname / SMS Gateway",
  },
  {
    value: "VOIP",
    label: "☎️ VoIP & Tổng đài IP",
  },

  // =========================================================
  // 🔑 SOFTWARE & LICENSE
  // =========================================================
  {
    value: "SOFTWARE_LICENSE",
    label: "🔑 Bản quyền Phần mềm",
  },
  {
    value: "SAAS",
    label: "☁️ Phần mềm SaaS",
  },
  {
    value: "OS_LICENSE",
    label: "🪟 Bản quyền Hệ điều hành",
  },
  {
    value: "DATABASE_LICENSE",
    label: "🗃️ Bản quyền Cơ sở dữ liệu",
  },
  {
    value: "OFFICE_PRODUCTIVITY",
    label: "📑 Phần mềm Văn phòng & Productivity",
  },
  {
    value: "DESIGN_SOFTWARE",
    label: "🎨 Phần mềm Thiết kế & Đồ họa",
  },
  {
    value: "DEVELOPER_LICENSE",
    label: "👨‍💻 Công cụ & Bản quyền Developer",
  },
  {
    value: "DEVOPS_TOOLS",
    label: "⚙️ Công cụ DevOps & CI/CD",
  },
  {
    value: "ERP",
    label: "📊 Hệ thống ERP",
  },
  {
    value: "CRM",
    label: "🤝 Hệ thống CRM",
  },
  {
    value: "HRM",
    label: "👥 Hệ thống HRM",
  },
  {
    value: "ACCOUNTING_SOFTWARE",
    label: "💰 Phần mềm Kế toán & Tài chính",
  },
  {
    value: "DOCUMENT_MANAGEMENT",
    label: "📁 Quản lý Tài liệu / DMS",
  },
  {
    value: "COLLABORATION_SOFTWARE",
    label: "💬 Phần mềm Collaboration & Communication",
  },

  // =========================================================
  // 👨‍💻 SOFTWARE DEVELOPMENT
  // =========================================================
  {
    value: "SOFTWARE_DEVELOPMENT",
    label: "👨‍💻 Phát triển Phần mềm",
  },
  {
    value: "WEB_DEVELOPMENT",
    label: "🌐 Phát triển Website / Web Application",
  },
  {
    value: "MOBILE_DEVELOPMENT",
    label: "📱 Phát triển Ứng dụng Mobile",
  },
  {
    value: "DESKTOP_DEVELOPMENT",
    label: "🖥️ Phát triển Ứng dụng Desktop",
  },
  {
    value: "API_DEVELOPMENT",
    label: "🔌 Phát triển API / Backend",
  },
  {
    value: "SYSTEM_INTEGRATION",
    label: "🔗 Tích hợp Hệ thống",
  },
  {
    value: "SOFTWARE_CUSTOMIZATION",
    label: "🛠️ Tùy chỉnh & Customization Phần mềm",
  },
  {
    value: "SOFTWARE_MIGRATION",
    label: "🚚 Migration & Chuyển đổi Hệ thống",
  },
  {
    value: "SOFTWARE_UPGRADE",
    label: "⬆️ Nâng cấp Hệ thống / Phần mềm",
  },
  {
    value: "SOFTWARE_IMPLEMENTATION",
    label: "⚙️ Triển khai & Cài đặt Phần mềm",
  },

  // =========================================================
  // ☁️ CLOUD & DATACENTER
  // =========================================================
  {
    value: "CLOUD_HOSTING",
    label: "☁️ Cloud Hosting",
  },
  {
    value: "CLOUD_COMPUTE",
    label: "☁️ Cloud Compute / IaaS",
  },
  {
    value: "CLOUD_STORAGE",
    label: "☁️ Cloud Storage",
  },
  {
    value: "CLOUD_DATABASE",
    label: "🗃️ Cloud Database / DBaaS",
  },
  {
    value: "CLOUD_PLATFORM",
    label: "⚙️ Cloud Platform / PaaS",
  },
  {
    value: "CLOUD_SECURITY",
    label: "🛡️ Cloud Security",
  },
  {
    value: "CLOUD_MIGRATION",
    label: "🚚 Cloud Migration",
  },
  {
    value: "DATACENTER",
    label: "🏢 Data Center",
  },
  {
    value: "COLOCATION",
    label: "🏢 Thuê chỗ đặt Máy chủ / Colocation",
  },
  {
    value: "DISASTER_RECOVERY_SITE",
    label: "🏢 Trung tâm Dự phòng / Disaster Recovery Site",
  },

  // =========================================================
  // 🛡️ CYBER SECURITY
  // =========================================================
  {
    value: "CYBERSECURITY",
    label: "🛡️ An ninh mạng & Bảo mật thông tin",
  },
  {
    value: "ANTIVIRUS",
    label: "🦠 Antivirus / Anti-Malware",
  },
  {
    value: "EDR_XDR",
    label: "🔐 EDR / XDR",
  },
  {
    value: "DLP",
    label: "🔒 Data Loss Prevention / DLP",
  },
  {
    value: "SIEM",
    label: "📊 SIEM & Security Monitoring",
  },
  {
    value: "SOC",
    label: "🚨 SOC / Security Operation Center",
  },
  {
    value: "PENETRATION_TESTING",
    label: "🎯 Pentest & Kiểm thử xâm nhập",
  },
  {
    value: "SECURITY_AUDIT",
    label: "🔍 Audit & Đánh giá An toàn thông tin",
  },
  {
    value: "VULNERABILITY_ASSESSMENT",
    label: "🔎 Đánh giá Lỗ hổng Bảo mật",
  },
  {
    value: "IAM",
    label: "🪪 IAM & Quản lý Danh tính",
  },
  {
    value: "PKI_CERTIFICATE",
    label: "🔐 PKI, Chữ ký số & Chứng thư số",
  },
  {
    value: "SSL_CERTIFICATE",
    label: "🔒 SSL/TLS Certificate",
  },

  // =========================================================
  // 💾 DATA & BACKUP
  // =========================================================
  {
    value: "DATA_PLATFORM",
    label: "🗃️ Data Platform",
  },
  {
    value: "DATA_WAREHOUSE",
    label: "🏢 Data Warehouse",
  },
  {
    value: "DATA_LAKE",
    label: "🌊 Data Lake",
  },
  {
    value: "BI_ANALYTICS",
    label: "📈 Business Intelligence & Analytics",
  },
  {
    value: "DATA_INTEGRATION",
    label: "🔗 Data Integration / ETL",
  },
  {
    value: "DATA_BACKUP",
    label: "💾 Backup Dữ liệu",
  },
  {
    value: "DISASTER_RECOVERY",
    label: "♻️ Disaster Recovery / Khôi phục Thảm họa",
  },
  {
    value: "DATA_MIGRATION",
    label: "🚚 Di chuyển & Chuyển đổi Dữ liệu",
  },

  // =========================================================
  // 🤖 AI / AUTOMATION
  // =========================================================
  {
    value: "AI_SOLUTIONS",
    label: "🤖 Giải pháp Trí tuệ nhân tạo / AI",
  },
  {
    value: "GENERATIVE_AI",
    label: "✨ Generative AI / LLM",
  },
  {
    value: "AI_PLATFORM",
    label: "🧠 AI Platform & Machine Learning",
  },
  {
    value: "CHATBOT",
    label: "💬 Chatbot & Virtual Assistant",
  },
  {
    value: "RPA",
    label: "⚡ RPA & Tự động hóa Quy trình",
  },
  {
    value: "OCR",
    label: "📄 OCR & Nhận dạng Tài liệu",
  },

  // =========================================================
  // 🛠️ IT OPERATION
  // =========================================================
  {
    value: "MAINTENANCE_SLA",
    label: "🛠️ Bảo trì SLA & Hỗ trợ Kỹ thuật",
  },
  {
    value: "IT_SUPPORT",
    label: "🎧 IT Helpdesk & User Support",
  },
  {
    value: "MANAGED_SERVICES",
    label: "🔄 Managed IT Services",
  },
  {
    value: "SYSTEM_ADMINISTRATION",
    label: "🖥️ Quản trị Hệ thống",
  },
  {
    value: "NETWORK_OPERATION",
    label: "🌐 Vận hành & Quản trị Mạng",
  },
  {
    value: "DATABASE_ADMINISTRATION",
    label: "🗃️ Quản trị Cơ sở dữ liệu",
  },
  {
    value: "NOC",
    label: "📡 NOC / Network Operation Center",
  },
  {
    value: "SRE",
    label: "⚙️ SRE / Site Reliability Engineering",
  },

  // =========================================================
  // 👥 OUTSOURCING
  // =========================================================
  {
    value: "IT_OUTSOURCING",
    label: "👥 IT Outsourcing",
  },
  {
    value: "DEVELOPER_OUTSOURCING",
    label: "👨‍💻 Thuê ngoài Nhân sự Developer",
  },
  {
    value: "TESTING_OUTSOURCING",
    label: "🧪 Thuê ngoài QA / Tester",
  },
  {
    value: "HELPDESK_OUTSOURCING",
    label: "🎧 Thuê ngoài Helpdesk",
  },
  {
    value: "SECURITY_OUTSOURCING",
    label: "🛡️ Thuê ngoài Dịch vụ Security",
  },
  {
    value: "BPO_IT",
    label: "🏢 BPO Dịch vụ CNTT",
  },

  // =========================================================
  // 💼 CONSULTING
  // =========================================================
  {
    value: "IT_CONSULTING",
    label: "💼 Tư vấn Công nghệ thông tin",
  },
  {
    value: "DIGITAL_TRANSFORMATION",
    label: "🚀 Tư vấn Chuyển đổi số",
  },
  {
    value: "IT_ARCHITECTURE",
    label: "🏗️ Tư vấn Kiến trúc Hệ thống",
  },
  {
    value: "PROJECT_MANAGEMENT",
    label: "📋 Tư vấn Quản lý Dự án CNTT",
  },
  {
    value: "BUSINESS_ANALYSIS",
    label: "📊 Phân tích Nghiệp vụ / Business Analysis",
  },
  {
    value: "IT_GOVERNANCE",
    label: "🏛️ Tư vấn Quản trị CNTT",
  },

  // =========================================================
  // 🧪 TESTING & QUALITY
  // =========================================================
  {
    value: "SOFTWARE_TESTING",
    label: "🧪 Kiểm thử Phần mềm",
  },
  {
    value: "PERFORMANCE_TESTING",
    label: "⚡ Kiểm thử Hiệu năng",
  },
  {
    value: "AUTOMATION_TESTING",
    label: "🤖 Automation Testing",
  },
  {
    value: "UAT_SUPPORT",
    label: "✅ Hỗ trợ UAT & Nghiệm thu Hệ thống",
  },

  // =========================================================
  // 🎓 TRAINING
  // =========================================================
  {
    value: "IT_TRAINING",
    label: "🎓 Đào tạo CNTT",
  },
  {
    value: "SOFTWARE_TRAINING",
    label: "💻 Đào tạo Sử dụng Phần mềm",
  },
  {
    value: "CYBERSECURITY_TRAINING",
    label: "🛡️ Đào tạo An toàn thông tin",
  },
  {
    value: "CLOUD_TRAINING",
    label: "☁️ Đào tạo Cloud",
  },
  {
    value: "CERTIFICATION_TRAINING",
    label: "🏆 Đào tạo & Chứng chỉ Công nghệ",
  },

  // =========================================================
  // 🌐 WEBSITE / DIGITAL
  // =========================================================
  {
    value: "WEBSITE",
    label: "🌐 Website & Cổng thông tin điện tử",
  },
  {
    value: "DOMAIN",
    label: "🌍 Tên miền / Domain",
  },
  {
    value: "WEB_HOSTING",
    label: "🖥️ Web Hosting",
  },
  {
    value: "CDN",
    label: "🚀 CDN / Content Delivery Network",
  },
  {
    value: "EMAIL_SERVICE",
    label: "📧 Email doanh nghiệp",
  },
  {
    value: "DIGITAL_SIGNATURE",
    label: "✍️ Chữ ký số",
  },
  {
    value: "E_SIGNATURE",
    label: "📝 Dịch vụ Ký điện tử",
  },

  // =========================================================
  // 📱 DIGITAL SERVICES
  // =========================================================
  {
    value: "SMS_GATEWAY",
    label: "💬 SMS Gateway",
  },
  {
    value: "EMAIL_GATEWAY",
    label: "📧 Email Gateway",
  },
  {
    value: "PAYMENT_GATEWAY",
    label: "💳 Payment Gateway",
  },
  {
    value: "E_COMMERCE",
    label: "🛒 Nền tảng Thương mại điện tử",
  },
  {
    value: "DIGITAL_MARKETING_TECH",
    label: "📣 Nền tảng Digital Marketing",
  },
  {
    value: "SOCIAL_MEDIA_PLATFORM",
    label: "📱 Nền tảng Social Media / Social Listening",
  },

  // =========================================================
  // 🏢 OTHER IT SERVICES
  // =========================================================
  {
    value: "IT_ASSET_MANAGEMENT",
    label: "📦 Quản lý Tài sản CNTT",
  },
  {
    value: "IT_DISPOSAL",
    label: "♻️ Thanh lý & Xử lý Thiết bị CNTT",
  },
  {
    value: "E_WASTE",
    label: "♻️ Xử lý Rác thải Điện tử",
  },
  {
    value: "AMC",
    label: "🔧 Hợp đồng AMC / Bảo trì Thiết bị",
  },
  {
    value: "WARRANTY_EXTENSION",
    label: "🛡️ Gia hạn Bảo hành Thiết bị",
  },
  {
    value: "TECHNICAL_SUPPORT",
    label: "🔧 Hỗ trợ Kỹ thuật Chuyên sâu",
  },

  // =========================================================
  // 📄 OTHER
  // =========================================================
  {
    value: "OTHER_IT_SERVICE",
    label: "📄 Dịch vụ CNTT khác",
  },
  {
    value: "OTHER",
    label: "📄 Hợp đồng Dịch vụ khác",
  },
];

export const CONTRACT_TYPES = contractTypeList;

// Map cấu hình hiển thị loại hợp đồng cho Bảng, Card & Badge
export const CONTRACT_TYPE_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  SERVICE_MAINTENANCE: {
    label: "Bảo trì & Dịch vụ",
    icon: "🛠️",
    color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  },
  IT_HARDWARE: {
    label: "Phần cứng CNTT",
    icon: "🖥️",
    color: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  },
  SOFTWARE_LICENSE: {
    label: "Bản quyền & SaaS",
    icon: "🔑",
    color: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-800",
  },
  MAINTENANCE_SLA: {
    label: "Bảo trì SLA",
    icon: "🛠️",
    color: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  },
  INTERNET_TELECOM: {
    label: "Đường truyền Internet",
    icon: "🌐",
    color: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800",
  },
  CLOUD_HOSTING: {
    label: "Cloud & Server",
    icon: "☁️",
    color: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border-sky-200 dark:border-sky-800",
  },
  CONSULTING_OUTSOURCE: {
    label: "Tư vấn & Outsource",
    icon: "💼",
    color: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
  },
  OTHER: {
    label: "Dịch vụ khác",
    icon: "📄",
    color: "bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700",
  },
};
