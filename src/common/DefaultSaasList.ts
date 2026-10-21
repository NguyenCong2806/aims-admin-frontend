export const defaultPlanTierList = [
  { value: "Free", label: "Gói Miễn phí (Free Tier)", title: "Gói cơ bản giới hạn tính năng" },
  { value: "Starter", label: "Starter / Basic", title: "Gói khởi đầu cho cá nhân/nhóm nhỏ" },
  { value: "Standard", label: "Standard / Pro", title: "Gói tiêu chuẩn đầy đủ tính năng chính" },
  { value: "Business", label: "Business / Plus", title: "Gói dành cho quy mô doanh nghiệp vừa" },
  { value: "Enterprise", label: "Enterprise / Ultimate", title: "Gói cao cấp nhất với hỗ trợ 24/7 và bảo mật nâng cao" },
];

export interface ServiceBrandOption {
  value: string;
  label: string;
  title: string;
  category?: string;
}

export const serviceBrandList: ServiceBrandOption[] = [
  // ================= 1. AI & TRỢ LÝ THÔNG MINH =================
  {
    value: "CHATGPT",
    label: "OpenAI ChatGPT (Plus / Team / Enterprise)",
    title: "Mô hình ngôn ngữ lớn và trợ lý AI thông minh của OpenAI.",
    category: "AI & Automation",
  },
  {
  value: "GOOGLE_GEMINI",
  label: "Google Gemini (Advanced / Workspace)",
  title: "Trợ lý AI đa phương thức của Google tích hợp trong Workspace và dịch vụ đám mây.",
  category: "AI & Automation",
},
{
  value: "NOTEBOOK_LM",
  label: "Google NotebookLM (AI Research Assistant)",
  title: "Sổ tay nghiên cứu và trợ lý ghi chú thông minh trên nguồn tài liệu cá nhân/doanh nghiệp.",
  category: "AI & Automation",
},
  {
    value: "CLAUDE_AI",
    label: "Anthropic Claude (Team / Pro)",
    title: "Trợ lý AI phân tích dữ liệu, xử lý tài liệu lớn và lập trình của Anthropic.",
    category: "AI & Automation",
  },
  {
    value: "MIDJOURNEY",
    label: "Midjourney (Design AI)",
    title: "Công cụ AI tạo và xử lý hình ảnh chất lượng cao.",
    category: "AI & Automation",
  },
  {
    value: "GITHUB_COPILOT",
    label: "GitHub Copilot (AI Coding Assistant)",
    title: "Trợ lý lập trình AI hỗ trợ gợi ý và hoàn thiện mã nguồn trực tiếp trên IDE.",
    category: "AI & Automation",
  },

  // ================= 2. BỘ CÔNG CỤ VĂN PHÒNG & LƯU TRỮ ĐÁM MÂY =================
  {
    value: "GOOGLE_WORKSPACE",
    label: "Google Workspace (GSuite)",
    title: "Gmail doanh nghiệp, Google Drive, Google Meet, Docs, Sheets...",
    category: "Cloud Office & Storage",
  },
  {
    value: "MICROSOFT_365",
    label: "Microsoft 365 (Office 365)",
    title: "Bộ ứng dụng văn phòng: Outlook, Teams, OneDrive, Word, Excel bản quyền.",
    category: "Cloud Office & Storage",
  },
  {
    value: "DROPBOX",
    label: "Dropbox Business",
    title: "Dịch vụ lưu trữ và đồng bộ tập tin trực tuyến.",
    category: "Cloud Office & Storage",
  },
  {
    value: "SYNC_COM",
    label: "Sync.com (Zero-Knowledge Cloud)",
    title: "Lưu trữ đám mây bảo mật cao với công nghệ mã hóa đầu cuối (E2EE).",
    category: "Cloud Office & Storage",
  },
  {
    value: "BOX_COM",
    label: "Box.com (Enterprise Cloud Content)",
    title: "Nền tảng quản trị và lưu trữ nội dung dữ liệu cho doanh nghiệp.",
    category: "Cloud Office & Storage",
  },

  // ================= 3. TRUYỀN THÔNG, HỌP & GIAO TIẾP NỘI BỘ =================
  {
    value: "ZOOM",
    label: "Zoom Workplace / Meetings",
    title: "Giải pháp phòng họp video trực tuyến, Webinar và tổng đài Zoom Phone.",
    category: "Communication & Meeting",
  },
  {
    value: "SLACK",
    label: "Slack Technologies",
    title: "Nền tảng nhắn tin, phân kênh và tự động hóa giao tiếp công việc.",
    category: "Communication & Meeting",
  },
  {
    value: "GOOGLE_MEET",
    label: "Google Meet Enterprise",
    title: "Họp trực tuyến doanh nghiệp tích hợp sẵn trong Google Workspace.",
    category: "Communication & Meeting",
  },
  {
    value: "MICROSOFT_TEAMS",
    label: "Microsoft Teams Standalone",
    title: "Ứng dụng làm việc nhóm, chia sẻ tài liệu và họp thoại của Microsoft.",
    category: "Communication & Meeting",
  },

  // ================= 4. QUẢN LÝ DỰ ÁN, CÔNG VIỆC & WIKI =================
  {
    value: "ATLASSIAN_JIRA",
    label: "Atlassian Jira Software",
    title: "Hệ thống theo dõi lỗi, quản lý dự án Agile/Scrum/Kanban chuyên sâu.",
    category: "Project & Task Management",
  },
  {
    value: "ATLASSIAN_CONFLUENCE",
    label: "Atlassian Confluence",
    title: "Không gian làm việc và xây dựng hệ thống tài liệu wiki nội bộ.",
    category: "Project & Task Management",
  },
  {
    value: "NOTION",
    label: "Notion Team / Workspace",
    title: "Không gian ghi chú, quản lý công việc và cơ sở dữ liệu số tất-cả-trong-một.",
    category: "Project & Task Management",
  },
  {
    value: "TRELLO",
    label: "Trello Enterprise",
    title: "Quản lý công việc và quy trình trực quan dạng bảng Kanban.",
    category: "Project & Task Management",
  },
  {
    value: "ASANA",
    label: "Asana Business",
    title: "Nền tảng điều phối tiến độ, mục tiêu và dự án nhóm.",
    category: "Project & Task Management",
  },
  {
    value: "CLICKUP",
    label: "ClickUp Workspace",
    title: "Nền tảng quản trị dự án, tài liệu, mục tiêu và tự động hóa quy trình.",
    category: "Project & Task Management",
  },
  {
    value: "MONDAY_COM",
    label: "Monday.com Work OS",
    title: "Nền tảng tùy biến quy trình quản lý dự án và luồng công việc.",
    category: "Project & Task Management",
  },
  {
    value: "BASE_VN",
    label: "Base.vn Platform (Base Wework/Request...)",
    title: "Nền tảng quản trị doanh nghiệp phổ biến tại Việt Nam.",
    category: "Project & Task Management",
  },

  // ================= 5. LẬP TRÌNH, DEVOPS & MÃ NGUỒN =================
  {
    value: "GITHUB",
    label: "GitHub (Team / Enterprise)",
    title: "Quản lý kho mã nguồn Git, luồng CI/CD Actions và bảo mật code.",
    category: "Dev & Code Hosting",
  },
  {
    value: "GITLAB",
    label: "GitLab SaaS (Ultimate / Premium)",
    title: "Nền tảng DevOps hoàn chỉnh từ quản lý source code, CI/CD đến giám sát.",
    category: "Dev & Code Hosting",
  },
  {
    value: "BITBUCKET",
    label: "Bitbucket Cloud",
    title: "Kho lưu trữ Git của Atlassian, tích hợp sâu với Jira.",
    category: "Dev & Code Hosting",
  },
  {
    value: "DOCKER_HUB",
    label: "Docker Hub Business",
    title: "Dịch vụ lưu trữ, chia sẻ và kiểm tra bảo mật container Docker image.",
    category: "Dev & Code Hosting",
  },

  // ================= 6. THIẾT KẾ, SƠ ĐỒ & SÁNG TẠO =================
  {
    value: "CANVA",
    label: "Canva Pro / Teams",
    title: "Nền tảng thiết kế đồ họa, banner, ấn phẩm truyền thông trực tuyến.",
    category: "Design & Creative",
  },
  {
    value: "FIGMA",
    label: "Figma (Organization / Enterprise)",
    title: "Công cụ thiết kế giao diện UI/UX và tạo mẫu tương tác cộng tác thời gian thực.",
    category: "Design & Creative",
  },
  {
    value: "XMIND",
    label: "XMind Works",
    title: "Phần mềm vẽ sơ đồ tư duy (mindmap) và cấu trúc ý tưởng logic.",
    category: "Design & Creative",
  },
  {
    value: "MIRO",
    label: "Miro Visual Workspace",
    title: "Bảng trắng kỹ thuật số dùng cho họp ý tưởng (brainstorming) và thiết kế quy trình.",
    category: "Design & Creative",
  },
  // ================= THIẾT KẾ, VIDEO & SÁNG TẠO SỐ =================
  {
    value: "ADOBE_CREATIVE_CLOUD",
    label: "Adobe Creative Cloud (All Apps / Teams)",
    title: "Hệ sinh thái thiết kế & sáng tạo chuyên nghiệp: Photoshop, Illustrator, Premiere Pro, After Effects...",
    category: "Design & Creative",
  },
  {
    value: "CAPCUT",
    label: "CapCut Pro / For Business",
    title: "Phần mềm và nền tảng biên tập, dựng video ngắn đa nền tảng tích hợp công cụ AI của ByteDance.",
    category: "Design & Creative",
  },
  {
    value: "CAMTASIA",
    label: "TechSmith Camtasia (Screen Recorder & Video Editor)",
    title: "Phần mềm quay màn hình, làm video hướng dẫn, bài giảng điện tử (E-Learning) chuyên dụng.",
    category: "Design & Creative",
  },
  // ================= 7. BẢO MẬT, MẬT KHẨU & TRUY CẬP =================
  {
    value: "1PASSWORD",
    label: "1Password Business",
    title: "Trình quản lý mật khẩu doanh nghiệp và xác thực hai yếu tố tập trung.",
    category: "Security & Identity",
  },
  {
    value: "LASTPASS",
    label: "LastPass Enterprise",
    title: "Giải pháp quản lý thông tin đăng nhập và két sắt số an toàn.",
    category: "Security & Identity",
  },
  {
    value: "BITWARDEN",
    label: "Bitwarden Enterprise",
    title: "Trình quản lý mật khẩu mã nguồn mở bảo mật cao cho tổ chức.",
    category: "Security & Identity",
  },
  {
    value: "OKTA",
    label: "Okta Identity Cloud",
    title: "Hệ thống xác thực đơn điểm (SSO) và quản lý danh tính nhân sự.",
    category: "Security & Identity",
  },

  // ================= 8. MARKETING, EMAIL & KHÁCH HÀNG (CRM) =================
  {
    value: "HUBSPOT",
    label: "HubSpot CRM / Marketing Hub",
    title: "Nền tảng quản lý quan hệ khách hàng, inbound marketing và bán hàng.",
    category: "CRM & Marketing",
  },
  {
    value: "SALESFORCE",
    label: "Salesforce Cloud",
    title: "Hệ sinh thái CRM doanh nghiệp hàng đầu thế giới.",
    category: "CRM & Marketing",
  },
  {
    value: "MAILCHIMP",
    label: "Mailchimp (Intuit)",
    title: "Nền tảng gửi email marketing và tự động hóa chiến dịch tiếp thị.",
    category: "CRM & Marketing",
  },
  {
    value: "ZOOMINFO",
    label: "ZoomInfo Enterprise",
    title: "Dữ liệu thị trường B2B và thông tin liên hệ khách hàng tiềm năng.",
    category: "CRM & Marketing",
  },

  // ================= 9. KHÁC =================
  {
    value: "OTHER",
    label: "Khác (Dịch vụ SaaS khác)",
    title: "Dịch vụ phần mềm SaaS khác chưa được liệt kê ở trên.",
    category: "Other",
  },
  // ================= TÀI CHÍNH, KẾ TOÁN & HÓA ĐƠN =================
  {
    value: "MISA_AMIS",
    label: "MISA AMIS Kế toán / meInvoice",
    title: "Phần mềm kế toán doanh nghiệp, hóa đơn điện tử và quản lý tài chính phổ biến nhất của MISA.",
    category: "Finance & Accounting",
  },
  {
    value: "FAST_ACCOUNTING",
    label: "Fast Accounting Online",
    title: "Phần mềm kế toán đám mây cho doanh nghiệp vừa và nhỏ của FAST.",
  },
  {
    value: "BRAVO_ERP",
    label: "BRAVO (Kế toán quản trị & ERP)",
    title: "Hệ thống phần mềm quản trị tài chính kế toán và ERP cho doanh nghiệp quy mô lớn.",
    category: "Finance & Accounting",
  },
  {
    value: "EFFECT",
    label: "EFFECT Accounting",
    title: "Phần mềm kế toán và quản trị doanh nghiệp tùy biến chuyên sâu.",
    category: "Finance & Accounting",
  },
  {
    value: "VIETTEL_SINVOICE",
    label: "Viettel S-Invoice (Hóa đơn điện tử)",
    title: "Dịch vụ giải pháp phát hành và quản lý hóa đơn điện tử của Tập đoàn Viettel.",
    category: "Finance & Accounting",
  },
  {
    value: "VNPT_EINVOICE",
    label: "VNPT Invoice",
    title: "Giải pháp hóa đơn điện tử an toàn, tiện lợi của Tập đoàn VNPT.",
    category: "Finance & Accounting",
  },
  {
    value: "QUICKBOOKS",
    label: "Intuit QuickBooks Online",
    title: "Nền tảng quản lý tài chính, hóa đơn và kế toán chuẩn quốc tế hàng đầu thế giới.",
    category: "Finance & Accounting",
  },
  {
    value: "XERO",
    label: "Xero Accounting",
    title: "Phần mềm kế toán trực tuyến đám mây tiêu chuẩn quốc tế cho doanh nghiệp vừa và nhỏ.",
    category: "Finance & Accounting",
  },
  {
    value: "SAP_BUSINESS_ONE",
    label: "SAP Business One / S/4HANA Finance",
    title: "Giải pháp ERP quản trị tài chính kế toán cao cấp của SAP.",
    category: "Finance & Accounting",
  },
  {
    value: "ORACLE_NETSUITE",
    label: "Oracle NetSuite Cloud ERP",
    title: "Hệ thống quản lý tài chính doanh nghiệp, hợp nhất báo cáo trên nền tảng đám mây của Oracle.",
    category: "Finance & Accounting",
  },
];