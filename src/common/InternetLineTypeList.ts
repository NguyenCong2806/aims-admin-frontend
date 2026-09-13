export const internetLineTypeList = [
  {
    value: "FTTH",
    label: "Cáp quang FTTH (Doanh nghiệp/Gia đình)",
    title: "Đường truyền Internet cáp quang băng thông rộng tiêu chuẩn.",
  },
  {
    value: "LEASED_LINE",
    label: "Kênh thuê riêng (Leased Line)",
    title: "Đường truyền vật lý riêng biệt, tốc độ cam kết đối xứng 100%, bảo mật cao.",
  },
  {
    value: "MPLS",
    label: "Mạng riêng ảo MPLS VPN",
    title: "Mạng diện rộng kết nối các văn phòng, chi nhánh an toàn.",
  },
  {
    value: "4G_5G_BACKUP",
    label: "Đường dự phòng 4G/5G Router",
    title: "Giải pháp mạng không dây dự phòng sự cố đứt cáp.",
  },
];

export const ipTypeList = [
  {
    value: "DYNAMIC",
    label: "IP Động (Dynamic IP)",
    title: "Địa chỉ IP thay đổi mỗi lần kết nối mạng.",
  },
  {
    value: "STATIC_SINGLE",
    label: "1 IP Tĩnh (Single Static IP)",
    title: "Được cấp duy nhất 1 địa chỉ IP tĩnh dùng cố định.",
  },
  {
    value: "STATIC_BLOCK",
    label: "Khối IP Tĩnh (/30, /29, /28)",
    title: "Được nhà mạng gán một dải subnet IP tĩnh (4, 8, 16 IP...).",
  },
];