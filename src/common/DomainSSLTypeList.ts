export const domainsslList = [
  // Domain
  {
    value: "DOMAIN",
    label: "Tên miền",
    title: "Tên miền của website hoặc hệ thống, ví dụ: example.com",
  },
  {
    value: "SSL",
    label: "Chứng chỉ SSL / TLS",
    title: "Chứng chỉ bảo mật SSL / TLS cho tên miền, ví dụ: example.com",
  },
];

export const domainsslTypeList = [
  // ==================== DOMAIN ====================
  {
    value: "DOMAIN",
    label: "Tên miền chính",
    title: "Tên miền chính của website hoặc hệ thống, ví dụ: example.com",
  },
  {
    value: "SUBDOMAIN",
    label: "Tên miền phụ",
    title: "Tên miền nằm dưới domain chính, ví dụ: api.example.com",
  },
  {
    value: "COUNTRY_DOMAIN",
    label: "Tên miền quốc gia",
    title: "Tên miền theo mã quốc gia, ví dụ: .vn, .jp, .us",
  },
  {
    value: "GENERIC_DOMAIN",
    label: "Tên miền quốc tế",
    title: "Tên miền quốc tế phổ biến như .com, .net, .org",
  },
  {
    value: "PREMIUM_DOMAIN",
    label: "Tên miền cao cấp",
    title: "Tên miền có giá trị cao hoặc có mức phí đăng ký đặc biệt",
  },

  // ==================== SSL - PRODUCT ====================
  {
    value: "POSITIVE_SSL",
    label: "PositiveSSL",
    title: "Chứng chỉ SSL DV phổ biến của Sectigo, phù hợp cho website và hệ thống thông thường",
  },
  {
    value: "POSITIVESSL_WILDCARD",
    label: "PositiveSSL Wildcard",
    title: "Chứng chỉ PositiveSSL dạng Wildcard, bảo vệ domain chính và các subdomain",
  },
  {
    value: "POSITIVESSL_MULTI_DOMAIN",
    label: "PositiveSSL Multi-Domain",
    title: "Chứng chỉ PositiveSSL cho phép bảo vệ nhiều domain trong một chứng chỉ",
  },
  {
    value: "RAPIDSSL",
    label: "RapidSSL",
    title: "Chứng chỉ SSL DV của DigiCert, phù hợp cho một domain",
  },
  {
    value: "RAPIDSSL_WILDCARD",
    label: "RapidSSL Wildcard",
    title: "Chứng chỉ RapidSSL dạng Wildcard, bảo vệ domain chính và các subdomain",
  },
  {
    value: "MULTI_SSL_DV",
    label: "Multi SSL-DV",
    title: "Chứng chỉ SSL DV hỗ trợ bảo vệ nhiều domain trong cùng một chứng chỉ",
  },
  {
    value: "MULTI_DOMAIN_SSL",
    label: "Multi-Domain SSL",
    title: "Chứng chỉ SSL hỗ trợ nhiều tên miền trong một chứng chỉ",
  },
  {
    value: "WILDCARD_SSL",
    label: "Wildcard SSL",
    title: "Chứng chỉ SSL bảo vệ domain chính và nhiều subdomain",
  },

  // ==================== SSL - VALIDATION ====================
  {
    value: "DV_SSL",
    label: "DV SSL",
    title: "Domain Validation - xác thực quyền sở hữu tên miền",
  },
  {
    value: "OV_SSL",
    label: "OV SSL",
    title: "Organization Validation - xác thực tên miền và thông tin tổ chức",
  },
  {
    value: "EV_SSL",
    label: "EV SSL",
    title: "Extended Validation - chứng chỉ yêu cầu quy trình xác thực tổ chức nghiêm ngặt",
  },

  // ==================== SSL - OTHER ====================
  {
    value: "CODE_SIGNING",
    label: "Code Signing Certificate",
    title: "Chứng chỉ dùng để ký số phần mềm, ứng dụng hoặc mã nguồn",
  },
  {
    value: "CLIENT_SSL",
    label: "Client SSL Certificate",
    title: "Chứng chỉ dùng để xác thực client trong kết nối bảo mật",
  },
  {
    value: "EMAIL_SSL",
    label: "Email SSL Certificate",
    title: "Chứng chỉ dùng để bảo mật và xác thực hệ thống email",
  },
];

export const domainSslPurposeList = [
  // Marketing / Website
  {
    value: "BRAND",
    label: "Xây dựng thương hiệu",
    title: "Phục vụ nhận diện và xây dựng thương hiệu trên Internet",
  },
  {
    value: "MARKETING_CAMPAIGN",
    label: "Chiến dịch Marketing",
    title: "Phục vụ các chiến dịch marketing, quảng cáo và truyền thông",
  },
  {
    value: "LANDING_PAGE",
    label: "Landing Page",
    title: "Phục vụ landing page cho chiến dịch hoặc chương trình marketing",
  },
  {
    value: "PRODUCT",
    label: "Quảng bá sản phẩm",
    title: "Phục vụ giới thiệu và quảng bá sản phẩm hoặc dịch vụ",
  },
  {
    value: "E_COMMERCE",
    label: "Thương mại điện tử",
    title: "Phục vụ website bán hàng và giao dịch trực tuyến",
  },
  {
    value: "PROMOTION",
    label: "Khuyến mãi / Ưu đãi",
    title: "Phục vụ chương trình khuyến mãi, ưu đãi hoặc bán hàng",
  },
  {
    value: "EVENT",
    label: "Sự kiện",
    title: "Phục vụ website hoặc landing page cho sự kiện",
  },
  {
    value: "SEO",
    label: "SEO",
    title: "Phục vụ hoạt động SEO và tăng lưu lượng truy cập tự nhiên",
  },
  {
    value: "CONTENT",
    label: "Content / Blog",
    title: "Phục vụ blog, tin tức và hoạt động content marketing",
  },
  {
    value: "LEAD_GENERATION",
    label: "Thu thập Lead",
    title: "Phục vụ thu thập thông tin khách hàng tiềm năng",
  },

  // Website / Application
  {
    value: "CORPORATE_WEBSITE",
    label: "Website doanh nghiệp",
    title: "Phục vụ website chính thức của doanh nghiệp",
  },
  {
    value: "APPLICATION",
    label: "Ứng dụng",
    title: "Phục vụ ứng dụng hoặc hệ thống phần mềm",
  },
  {
    value: "API",
    label: "API / Backend",
    title: "Phục vụ API, backend hoặc dịch vụ tích hợp",
  },
  {
    value: "CUSTOMER_PORTAL",
    label: "Cổng khách hàng",
    title: "Phục vụ hệ thống dành cho khách hàng",
  },
  {
    value: "INTERNAL_SYSTEM",
    label: "Hệ thống nội bộ",
    title: "Phục vụ các hệ thống sử dụng trong nội bộ doanh nghiệp",
  },
  {
    value: "EMAIL",
    label: "Email",
    title: "Phục vụ hệ thống email và giao tiếp doanh nghiệp",
  },

  // SSL / Security
  {
    value: "DATA_ENCRYPTION",
    label: "Mã hóa dữ liệu",
    title: "Mã hóa dữ liệu truyền giữa client và server thông qua HTTPS/TLS",
  },
  {
    value: "HTTPS",
    label: "Bảo mật HTTPS",
    title: "Bảo vệ kết nối website bằng giao thức HTTPS",
  },
  {
    value: "SERVER_AUTHENTICATION",
    label: "Xác thực máy chủ",
    title: "Xác thực máy chủ giúp người dùng xác định đang kết nối đúng hệ thống",
  },
  {
    value: "CLIENT_AUTHENTICATION",
    label: "Xác thực Client",
    title: "Xác thực client bằng chứng chỉ trong mô hình Mutual TLS",
  },
  {
    value: "ORGANIZATION_VALIDATION",
    label: "Xác thực tổ chức",
    title: "Xác thực danh tính và thông tin của tổ chức sở hữu chứng chỉ",
  },
  {
    value: "SECURE_API",
    label: "Bảo mật API",
    title: "Bảo vệ API và dữ liệu trao đổi giữa các hệ thống",
  },
  {
    value: "SECURE_PAYMENT",
    label: "Bảo mật thanh toán",
    title: "Bảo vệ thông tin và giao dịch thanh toán trực tuyến",
  },
  {
    value: "SECURE_LOGIN",
    label: "Bảo mật đăng nhập",
    title: "Bảo vệ thông tin đăng nhập và phiên giao dịch của người dùng",
  },
  {
    value: "COMPLIANCE",
    label: "Đáp ứng yêu cầu bảo mật",
    title: "Sử dụng chứng chỉ để đáp ứng yêu cầu hoặc tiêu chuẩn bảo mật",
  },

  // Infrastructure
  {
    value: "SYSTEM_SERVICE",
    label: "Dịch vụ hệ thống",
    title: "Phục vụ các dịch vụ và hệ thống CNTT",
  },
  {
    value: "MICROSERVICE",
    label: "Microservice",
    title: "Phục vụ giao tiếp bảo mật giữa các microservice",
  },
  {
    value: "VPN",
    label: "VPN",
    title: "Bảo mật kết nối VPN hoặc kết nối riêng",
  },
  {
    value: "SERVER_TO_SERVER",
    label: "Server-to-Server",
    title: "Bảo mật kết nối và trao đổi dữ liệu giữa các máy chủ",
  },

  // Other
  {
    value: "REDIRECT",
    label: "Redirect / Chuyển hướng",
    title: "Chuyển hướng người dùng từ domain này sang domain khác",
  },
  {
    value: "BRAND_PROTECTION",
    label: "Bảo vệ thương hiệu",
    title: "Đăng ký hoặc duy trì tài nguyên để bảo vệ thương hiệu",
  },
  {
    value: "RESERVED",
    label: "Đăng ký giữ tài nguyên",
    title: "Đăng ký tài nguyên nhưng chưa đưa vào sử dụng",
  },
  {
    value: "OTHER",
    label: "Khác",
    title: "Mục đích sử dụng khác",
  },
];

export const functionalScopeList = [
  { value: "MARKETING", label: "Marketing" },
  { value: "SALES", label: "Bán hàng" },
  { value: "SEO", label: "SEO" },
  { value: "CUSTOMER", label: "Khách hàng" },
  { value: "INTERNAL", label: "Nội bộ" },
  { value: "SYSTEM", label: "Hệ thống" },
  { value: "API", label: "API / Tích hợp" },
  { value: "SECURITY", label: "Bảo mật" },
  { value: "EMAIL", label: "Email" },
];

export const relatedProgramList = [
  // ==================== ĐẠI HỌC / ĐƠN VỊ ====================
  {
    value: "PTIT",
    label: "PTIT",
    title: "Học viện Công nghệ Bưu chính Viễn thông",
  },
  {
    value: "AOF",
    label: "AOF",
    title: "Học viện Tài chính",
  },
  {
    value: "TNU",
    label: "TNU",
    title: "Đại học Thái Nguyên",
  },
  {
    value: "TNUT",
    label: "TNUT",
    title: "Trường Đại học Kỹ thuật Công nghiệp - Đại học Thái Nguyên",
  },
  {
    value: "TUAF",
    label: "TUAF",
    title: "Trường Đại học Nông Lâm - Đại học Thái Nguyên",
  },
  {
    value: "HOU",
    label: "HOU",
    title: "Trường Đại học Mở Hà Nội",
  },
  {
    value: "HNMU",
    label: "HNMU",
    title: "Trường Đại học Thủ đô Hà Nội",
  },
  {
    value: "ULSA",
    label: "ULSA",
    title: "Trường Đại học Lao động - Xã hội",
  },
  {
    value: "LDA",
    label: "LDA",
    title: "Trường Đại học Công đoàn",
  },
  {
    value: "AJC",
    label: "AJC",
    title: "Học viện Báo chí và Tuyên truyền",
  },
  {
    value: "HCCT",
    label: "HCCT",
    title: "Trường Cao đẳng Thương mại và Du lịch Hà Nội",
  },
  {
    value: "ENEU",
    label: "ENEU",
    title: "Chương trình đào tạo từ xa / E-Learning của Đại học Kinh tế Quốc dân",
  },

  // ==================== CHƯƠNG TRÌNH / HỆ THỐNG ====================
  {
    value: "OME",
    label: "OM'E",
    title: "Chương trình / hệ thống OM'E",
  },
  {
    value: "OMC",
    label: "OMC",
    title: "Chương trình / hệ thống OMC",
  },
  {
    value: "E_TEACHING",
    label: "E-Teaching",
    title: "Hệ thống / nền tảng hỗ trợ giảng dạy trực tuyến",
  },
  {
    value: "SAM",
    label: "SAM",
    title: "Chương trình / hệ thống SAM",
  },
  {
    value: "VMC",
    label: "VMC",
    title: "Chương trình / hệ thống VMC",
  },

  // ==================== NGOẠI NGỮ / CHỨNG CHỈ ====================
  {
    value: "HSK",
    label: "HSK",
    title: "Kỳ thi đánh giá năng lực tiếng Trung HSK",
  },
  {
    value: "IELTS",
    label: "IELTS",
    title: "Hệ thống / chương trình liên quan đến kỳ thi IELTS",
  },
  {
    value: "VSTEP",
    label: "VSTEP",
    title: "Kỳ thi đánh giá năng lực tiếng Anh theo Khung năng lực ngoại ngữ 6 bậc dùng cho Việt Nam",
  },
  {
    value: "JLPT",
    label: "JLPT",
    title: "Kỳ thi năng lực tiếng Nhật JLPT",
  },

  // ==================== MÔ HÌNH KINH DOANH ====================
  {
    value: "B2B",
    label: "B2B",
    title: "Business to Business - phục vụ khách hàng doanh nghiệp",
  },
  {
    value: "B2C",
    label: "B2C",
    title: "Business to Consumer - phục vụ khách hàng cá nhân",
  },

  // ==================== TÍCH HỢP / KỸ THUẬT ====================
  {
    value: "API",
    label: "API",
    title: "Giao diện lập trình ứng dụng dùng để tích hợp và trao đổi dữ liệu giữa các hệ thống",
  },
];