import React, { useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import PageMeta from "../../components/common/PageMeta";
import { toast } from "sonner";

export const AnalyticsReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"all" | "financial" | "hardware" | "performance">("all");
  const [timeRange, setTimeRange] = useState<string>("2024");

  // ==========================================
  // 1. AREA CHART: XU HƯỚNG CHI PHÍ & KHẤU HAO (12 THÁNG)
  // ==========================================
  const areaChartOptions: ApexOptions = {
    chart: {
      type: "area",
      height: 320,
      fontFamily: "Outfit, sans-serif",
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    colors: ["#6366f1", "#10b981"], // Indigo & Emerald
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [0, 90, 100],
      },
    },
    stroke: {
      curve: "smooth",
      width: 2.5,
    },
    dataLabels: { enabled: false },
    markers: {
      size: 0,
      hover: { size: 6 },
    },
    xaxis: {
      categories: [
        "T1", "T2", "T3", "T4", "T5", "T6",
        "T7", "T8", "T9", "T10", "T11", "T12",
      ],
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        formatter: (val) => `${val} tr`,
      },
    },
    tooltip: {
      y: {
        formatter: (val) => `${val.toLocaleString()} triệu VNĐ`,
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
    },
    grid: {
      borderColor: "#f1f5f9",
      strokeDashArray: 4,
    },
  };

  const areaChartSeries = [
    {
      name: "Chi phí mua sắm mới (Capex)",
      data: [45, 52, 38, 65, 82, 70, 95, 110, 88, 75, 92, 120],
    },
    {
      name: "Chi phí bảo trì & SaaS (Opex)",
      data: [25, 28, 30, 32, 35, 34, 38, 42, 40, 41, 45, 48],
    },
  ];

  // ==========================================
  // 2. DONUT CHART: CƠ CẤU DANH MỤC THIẾT BỊ PHẦN CỨNG
  // ==========================================
  const donutChartOptions: ApexOptions = {
    chart: {
      type: "donut",
      fontFamily: "Outfit, sans-serif",
    },
    colors: ["#6366f1", "#3b82f6", "#10b981", "#f59e0b", "#ec4899"],
    labels: ["Laptop di động", "Máy trạm để bàn", "Máy chủ & Network", "Màn hình 4K", "Thiết bị khác"],
    dataLabels: { enabled: false },
    legend: {
      position: "bottom",
      horizontalAlign: "center",
      formatter: (val, opts) => `${val}: ${opts.w.globals.series[opts.seriesIndex]} máy`,
    },
    plotOptions: {
      pie: {
        donut: {
          size: "72%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Tổng thiết bị",
              fontSize: "14px",
              fontWeight: 600,
              color: "#64748b",
              formatter: () => "248 máy",
            },
          },
        },
      },
    },
    tooltip: {
      y: {
        formatter: (val) => `${val} thiết bị (${((val / 248) * 100).toFixed(1)}%)`,
      },
    },
  };

  const donutChartSeries = [95, 78, 35, 28, 12];

  // ==========================================
  // 3. GROUPED COLUMN BAR CHART: THIẾT BỊ THEO PHÒNG BAN
  // ==========================================
  const barChartOptions: ApexOptions = {
    chart: {
      type: "bar",
      height: 320,
      fontFamily: "Outfit, sans-serif",
      toolbar: { show: false },
    },
    colors: ["#10b981", "#3b82f6", "#f43f5e"],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "50%",
        borderRadius: 4,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ["transparent"] },
    xaxis: {
      categories: ["CNTT & Dev", "Kinh doanh", "Kế toán", "HC - Nhân sự", "Kho & Vận hành"],
    },
    yaxis: {
      labels: { formatter: (val) => `${val} tb` },
    },
    legend: { position: "top", horizontalAlign: "right" },
    grid: { strokeDashArray: 4, borderColor: "#f1f5f9" },
    tooltip: {
      y: { formatter: (val) => `${val} thiết bị` },
    },
  };

  const barChartSeries = [
    { name: "Đang sử dụng", data: [68, 42, 28, 32, 24] },
    { name: "Dự phòng kho", data: [12, 8, 4, 6, 5] },
    { name: "Đang bảo trì", data: [3, 2, 1, 2, 4] },
  ];

  // ==========================================
  // 4. RADIAL BAR CHART: CHỈ SỐ SỨC KHỎE & TUÂN THỦ
  // ==========================================
  const radialChartOptions: ApexOptions = {
    chart: {
      type: "radialBar",
      height: 320,
      fontFamily: "Outfit, sans-serif",
    },
    colors: ["#10b981", "#6366f1", "#f59e0b"],
    plotOptions: {
      radialBar: {
        hollow: { size: "40%" },
        track: { background: "#f1f5f9" },
        dataLabels: {
          name: { fontSize: "12px" },
          value: { fontSize: "16px", fontWeight: "bold" },
          total: {
            show: true,
            label: "Điểm hạ tầng",
            formatter: () => "91 / 100",
          },
        },
      },
    },
    labels: ["Bản quyền Windows/Office", "Uptime máy trạm", "Còn hạn bảo hành"],
  };

  const radialChartSeries = [94, 98, 82];

  // ==========================================
  // 5. RADAR / SPIDER CHART: NĂNG LỰC HẠ TẦNG CNTT
  // ==========================================
  const radarChartOptions: ApexOptions = {
    chart: {
      type: "radar",
      height: 330,
      fontFamily: "Outfit, sans-serif",
      toolbar: { show: false },
    },
    colors: ["#6366f1", "#f43f5e"],
    stroke: { width: 2 },
    fill: { opacity: 0.2 },
    markers: { size: 3 },
    xaxis: {
      categories: [
        "Tuân thủ Bản quyền",
        "Tối ưu Chi phí",
        "Hiệu suất CPU/RAM",
        "An toàn Thông tin",
        "Tốc độ xử lý SLA",
        "Tỷ lệ Dự phòng",
      ],
    },
    yaxis: { show: false, min: 0, max: 100 },
    legend: { position: "top", horizontalAlign: "center" },
  };

  const radarChartSeries = [
    { name: "Hiện trạng thực tế", data: [94, 78, 86, 92, 88, 75] },
    { name: "Mục tiêu KPI 2024", data: [98, 85, 90, 95, 95, 85] },
  ];

  // ==========================================
  // 6. HEATMAP CHART: MA TRẬN MẬT ĐỘ TẢI CPU/RAM MÁY TRẠM
  // ==========================================
  const heatmapChartOptions: ApexOptions = {
    chart: {
      type: "heatmap",
      height: 300,
      fontFamily: "Outfit, sans-serif",
      toolbar: { show: false },
    },
    dataLabels: { enabled: false },
    colors: ["#6366f1"],
    plotOptions: {
      heatmap: {
        radius: 4,
        enableShades: true,
        shadeIntensity: 0.6,
        colorScale: {
          ranges: [
            { from: 0, to: 40, name: "Thấp (< 40%)", color: "#e0e7ff" },
            { from: 41, to: 70, name: "Vừa (41-70%)", color: "#818cf8" },
            { from: 71, to: 100, name: "Cao (> 70%)", color: "#4f46e5" },
          ],
        },
      },
    },
    xaxis: {
      categories: ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00"],
    },
    legend: { position: "top", horizontalAlign: "right" },
  };

  const heatmapChartSeries = [
    { name: "Thứ 2", data: [35, 78, 45, 88, 82, 40, 20] },
    { name: "Thứ 3", data: [40, 85, 50, 92, 86, 45, 22] },
    { name: "Thứ 4", data: [42, 82, 48, 89, 84, 42, 25] },
    { name: "Thứ 5", data: [38, 80, 46, 85, 80, 40, 18] },
    { name: "Thứ 6", data: [45, 90, 55, 95, 78, 35, 15] },
    { name: "Thứ 7", data: [20, 35, 25, 30, 28, 15, 10] },
  ];

  // ==========================================
  // 7. HORIZONTAL STACKED BAR: GIẢI NGÂN NGÂN SÁCH IT
  // ==========================================
  const stackedBarOptions: ApexOptions = {
    chart: {
      type: "bar",
      stacked: true,
      height: 280,
      fontFamily: "Outfit, sans-serif",
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
        barHeight: "60%",
      },
    },
    colors: ["#6366f1", "#f59e0b", "#94a3b8"],
    xaxis: {
      categories: ["Máy chủ & Cloud", "Máy trạm & Laptop", "Phần mềm & SaaS", "Mạng & Bảo mật", "Bảo trì & Sửa chữa"],
      labels: { formatter: (val) => `${val} tr` },
    },
    legend: { position: "top", horizontalAlign: "right" },
    grid: { strokeDashArray: 4, borderColor: "#f1f5f9" },
    tooltip: { y: { formatter: (val) => `${val} triệu VNĐ` } },
  };

  const stackedBarSeries = [
    { name: "Đã chi tiêu", data: [320, 410, 180, 95, 45] },
    { name: "Đã cam kết hợp đồng", data: [80, 60, 45, 25, 15] },
    { name: "Ngân sách còn lại", data: [100, 130, 75, 30, 20] },
  ];

  return (
    <>
      <PageMeta
        title="Báo cáo & Thống kê Tài sản IT | AIMS Enterprise"
        description="Kho thư viện các dạng biểu đồ phân tích chi phí, xu hướng khấu hao, danh mục phần cứng và hiệu năng"
      />

      <div className="p-4 sm:p-6 space-y-6 w-full">
        {/* ================= HEADER VỚI BỘ LỌC THỜI GIAN ================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 text-xl font-bold">
                📊
              </span>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Báo cáo & Thống kê Phân tích Tài sản IT
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Mẫu biểu đồ trực quan hóa dữ liệu: Xu hướng chi phí, phân bổ thiết bị, bản quyền & hiệu năng
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={timeRange}
              onChange={(e) => {
                setTimeRange(e.target.value);
                toast.success(`Đã cập nhật dữ liệu báo cáo cho: Năm ${e.target.value}`);
              }}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 cursor-pointer shadow-xs"
            >
              <option value="2024">Năm 2024 (Hiện tại)</option>
              <option value="2023">Năm 2023</option>
              <option value="Q3">Quý 3 / 2024</option>
              <option value="Q2">Quý 2 / 2024</option>
            </select>

            <button
              onClick={() => toast.success("Đang xuất toàn bộ biểu đồ ra file PDF/Excel...")}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <span>📥</span>
              <span>Xuất Báo cáo</span>
            </button>
          </div>
        </div>

        {/* ================= 4 THẺ METRICS KPI TỔNG QUAN ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Giá trị tài sản phần cứng</span>
              <span className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 text-sm">💻</span>
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-gray-900 dark:text-white">1,425,000,000 ₫</div>
            <div className="mt-1 flex items-center gap-1.5 text-xs">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">↑ 12.4%</span>
              <span className="text-gray-400">so với cùng kỳ năm ngoái</span>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Chi phí Bản quyền & SaaS</span>
              <span className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 text-sm">🔐</span>
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-gray-900 dark:text-white">384,500,000 ₫</div>
            <div className="mt-1 flex items-center gap-1.5 text-xs">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">↓ 8.2%</span>
              <span className="text-gray-400">tiết kiệm sau rà soát</span>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Tổng máy trạm đang quản lý</span>
              <span className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 text-sm">🖥️</span>
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-gray-900 dark:text-white">248 thiết bị</div>
            <div className="mt-1 flex items-center gap-1.5 text-xs">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">98.4%</span>
              <span className="text-gray-400">đang trực tuyến bình thường</span>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Tỷ lệ tuân thủ bản quyền</span>
              <span className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 text-sm">🛡️</span>
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-gray-900 dark:text-white">94.2 %</div>
            <div className="mt-1 flex items-center gap-1.5 text-xs">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Đạt chuẩn</span>
              <span className="text-gray-400">kiểm toán phần mềm</span>
            </div>
          </div>
        </div>

        {/* ================= TABS CHỌN NHÓM BIỂU ĐỒ ================= */}
        <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-2">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === "all"
                ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            Tất cả dạng biểu đồ
          </button>
          <button
            onClick={() => setActiveTab("financial")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === "financial"
                ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            1. Chi phí & Ngân sách
          </button>
          <button
            onClick={() => setActiveTab("hardware")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === "hardware"
                ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            2. Phân bổ Phần cứng
          </button>
          <button
            onClick={() => setActiveTab("performance")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === "performance"
                ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            3. Giám sát & Hiệu năng
          </button>
        </div>

        {/* ================= KHU VỰC CÁC BIỂU ĐỒ ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 1. AREA CHART: XU HƯỚNG MUA SẮM & BẢO TRÌ */}
          {(activeTab === "all" || activeTab === "financial") && (
            <div className="p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span>📈</span>
                    <span>Biểu đồ Miền (Area Chart): Xu hướng Chi phí Mua sắm & Bảo trì</span>
                  </h3>
                  <p className="text-[11px] text-gray-400">So sánh chi phí đầu tư thiết bị (Capex) và phí dịch vụ vận hành (Opex)</p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">12 Tháng</span>
              </div>
              <Chart options={areaChartOptions} series={areaChartSeries} type="area" height={320} />
            </div>
          )}

          {/* 2. DONUT CHART: CƠ CẤU DANH MỤC THIẾT BỊ */}
          {(activeTab === "all" || activeTab === "hardware") && (
            <div className="p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span>🍩</span>
                    <span>Biểu đồ Tròn Khuyết (Donut Chart): Cơ cấu Phân loại Thiết bị</span>
                  </h3>
                  <p className="text-[11px] text-gray-400">Tỷ trọng các dòng sản phẩm phần cứng trong toàn bộ hệ sinh thái IT</p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700">248 Thiết bị</span>
              </div>
              <div className="pt-2">
                <Chart options={donutChartOptions} series={donutChartSeries} type="donut" height={320} />
              </div>
            </div>
          )}

          {/* 3. GROUPED COLUMN: TRẠNG THÁI THEO PHÒNG BAN */}
          {(activeTab === "all" || activeTab === "hardware") && (
            <div className="p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span>📊</span>
                    <span>Biểu đồ Cột Nhóm (Grouped Column): Thiết bị theo Phòng ban</span>
                  </h3>
                  <p className="text-[11px] text-gray-400">Phân loại máy móc: Đang dùng, Dự phòng sẵn sàng và Đang gửi bảo trì</p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">5 Phòng ban</span>
              </div>
              <Chart options={barChartOptions} series={barChartSeries} type="bar" height={320} />
            </div>
          )}

          {/* 4. RADIAL BAR: CHỈ SỐ SỨC KHỎE & TUÂN THỦ */}
          {(activeTab === "all" || activeTab === "performance") && (
            <div className="p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span>🎯</span>
                    <span>Biểu đồ Vòng đo (Radial Bar): Chỉ số Tuân thủ & Sức khỏe IT</span>
                  </h3>
                  <p className="text-[11px] text-gray-400">Đo lường mức độ tuân thủ bản quyền, uptime và trạng thái bảo hành</p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-50 text-purple-700">Đạt 91/100</span>
              </div>
              <Chart options={radialChartOptions} series={radialChartSeries} type="radialBar" height={320} />
            </div>
          )}

          {/* 5. RADAR CHART: MẠNG NHỆN ĐÁNH GIÁ ĐA CHIỀU */}
          {(activeTab === "all" || activeTab === "performance") && (
            <div className="p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span>🕸️</span>
                    <span>Biểu đồ Mạng Nhện (Radar Chart): Năng lực Vận hành Hạ tầng IT</span>
                  </h3>
                  <p className="text-[11px] text-gray-400">Đánh giá 6 trụ cột chính giữa Thực tế đo được và Mục tiêu đề ra</p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-50 text-rose-700">6 Tiêu chí</span>
              </div>
              <Chart options={radarChartOptions} series={radarChartSeries} type="radar" height={330} />
            </div>
          )}

          {/* 6. HEATMAP CHART: MA TRẬN MẬT ĐỘ TẢI CPU & RAM */}
          {(activeTab === "all" || activeTab === "performance") && (
            <div className="p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span>🌡️</span>
                    <span>Bản đồ Nhiệt (Heatmap): Mật độ Tải CPU/RAM Máy trạm</span>
                  </h3>
                  <p className="text-[11px] text-gray-400">Theo dõi cường độ làm việc của máy móc theo Ngày trong tuần & Khung giờ</p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">Thời gian thực</span>
              </div>
              <Chart options={heatmapChartOptions} series={heatmapChartSeries} type="heatmap" height={300} />
            </div>
          )}

          {/* 7. STACKED HORIZONTAL BAR: GIẢI NGÂN NGÂN SÁCH THEO HẠNG MỤC */}
          {(activeTab === "all" || activeTab === "financial") && (
            <div className="lg:col-span-2 p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span>📑</span>
                    <span>Biểu đồ Thanh Xếp chồng (Stacked Bar): Tiến độ Giải ngân Ngân sách CNTT</span>
                  </h3>
                  <p className="text-[11px] text-gray-400">Tỷ lệ: Đã giải ngân (Đã chi), Đã ký hợp đồng cam kết và Ngân sách khả dụng còn lại</p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  Tổng ngân sách: 1.5 Tỷ
                </span>
              </div>
              <Chart options={stackedBarOptions} series={stackedBarSeries} type="bar" height={280} />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AnalyticsReportsPage;
