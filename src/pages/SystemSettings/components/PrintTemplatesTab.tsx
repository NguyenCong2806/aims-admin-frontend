import React, { useState } from "react";
import { PrintTemplateConfig } from "../../../models/SystemConfig/systemConfigModel";

interface PrintTemplatesTabProps {
  data: PrintTemplateConfig;
  organizationName: string;
  onChange: (updated: PrintTemplateConfig) => void;
}

export const PrintTemplatesTab: React.FC<PrintTemplatesTabProps> = ({
  data,
  organizationName,
  onChange,
}) => {
  const [activePreview, setActivePreview] = useState<"LABEL" | "DOCUMENT">("LABEL");

  const handleChange = <K extends keyof PrintTemplateConfig>(
    field: K,
    value: PrintTemplateConfig[K]
  ) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  return (
    <div className="space-y-6">
      {/* Selector: Nhãn Barcode/QR vs Biên bản Bàn giao */}
      <div className="flex items-center gap-2 p-1.5 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setActivePreview("LABEL")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activePreview === "LABEL"
              ? "bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          <span>🏷️</span>
          <span>Tem nhãn Barcode / QR Code dán thiết bị</span>
        </button>

        <button
          type="button"
          onClick={() => setActivePreview("DOCUMENT")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activePreview === "DOCUMENT"
              ? "bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          <span>📄</span>
          <span>Mẫu Biên bản bàn giao thiết bị CNTT</span>
        </button>
      </div>

      {activePreview === "LABEL" ? (
        /* ================= 1. CẤU HÌNH TEM NHÃN BARCODE / QR CODE ================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Cột trái: Cài đặt tham số */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white dark:bg-gray-850 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Thông số Tem nhãn In ấn
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Định dạng mã vạch
                  </label>
                  <select
                    value={data.barcodeType}
                    onChange={(e) => handleChange("barcodeType", e.target.value as PrintTemplateConfig["barcodeType"])}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="QR_CODE">Mã phản hồi nhanh (QR Code - Khuyên dùng)</option>
                    <option value="CODE_128">Mã vạch tuyến tính (Code 128)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Kích thước decal in
                  </label>
                  <select
                    value={data.labelPaperSize}
                    onChange={(e) => handleChange("labelPaperSize", e.target.value as PrintTemplateConfig["labelPaperSize"])}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="50x30mm">50 x 30 mm (Chuẩn dán Laptop, PC)</option>
                    <option value="70x40mm">70 x 40 mm (Chuẩn dán Server, Máy in)</option>
                    <option value="100x60mm">100 x 60 mm (Nhãn khổ lớn)</option>
                    <option value="A4_DECALS">Khổ A4 (Giấy decal nhiều tem)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Đường dẫn quét QR tra cứu trên thiết bị di động
                </label>
                <input
                  type="text"
                  value={data.qrCodeUrlPrefix}
                  onChange={(e) => handleChange("qrCodeUrlPrefix", e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Khi dùng camera điện thoại quét QR, nhân viên kỹ thuật sẽ được điều hướng thẳng đến hồ sơ thiết bị.
                </p>
              </div>

              {/* Toggles hiển thị trường trên tem */}
              <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-3">
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Các thông tin in trên mặt tem
                </p>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                  <span className="text-xs text-gray-700 dark:text-gray-300">
                    In Tên doanh nghiệp trên đầu tem
                  </span>
                  <input
                    type="checkbox"
                    checked={data.showCompanyNameOnLabel}
                    onChange={(e) => handleChange("showCompanyNameOnLabel", e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                  <span className="text-xs text-gray-700 dark:text-gray-300">
                    In Số Serial Number (S/N) của nhà sản xuất
                  </span>
                  <input
                    type="checkbox"
                    checked={data.showSerialNumberOnLabel}
                    onChange={(e) => handleChange("showSerialNumberOnLabel", e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                  <span className="text-xs text-gray-700 dark:text-gray-300">
                    In Loại danh mục thiết bị (VD: Máy tính trạm, Laptop)
                  </span>
                  <input
                    type="checkbox"
                    checked={data.showCategoryOnLabel}
                    onChange={(e) => handleChange("showCategoryOnLabel", e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Cột phải: Live Preview trực quan tem dán */}
          <div className="lg:col-span-5">
            <div className="bg-slate-100 dark:bg-gray-800/60 rounded-2xl p-5 border border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center min-h-[360px]">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">
                Xem trước thực tế (Khổ {data.labelPaperSize})
              </span>

              {/* Simulated Sticker Label */}
              <div className="w-[300px] bg-white text-gray-900 rounded-xl p-4 shadow-xl border-2 border-slate-300 relative flex flex-col justify-between select-none">
                {/* Header Sticker */}
                {data.showCompanyNameOnLabel && (
                  <div className="border-b border-gray-300 pb-1.5 mb-2 text-center">
                    <p className="text-[10px] font-extrabold tracking-wider text-indigo-900 uppercase truncate">
                      {organizationName}
                    </p>
                    <p className="text-[8px] text-gray-500 font-medium">HỆ THỐNG QUẢN LÝ TÀI SẢN CNTT</p>
                  </div>
                )}

                {/* Body Sticker: QR Code + Info */}
                <div className="flex items-center gap-3">
                  {/* QR Box */}
                  <div className="w-20 h-20 bg-slate-900 rounded-lg p-1.5 shrink-0 flex flex-col items-center justify-center shadow-inner">
                    <div className="w-full h-full bg-white p-1 rounded flex items-center justify-center">
                      <svg viewBox="0 0 32 32" className="w-full h-full fill-slate-900">
                        {/* Simulated QR Pattern */}
                        <rect x="2" y="2" width="10" height="10" rx="1" />
                        <rect x="4" y="4" width="6" height="6" fill="#fff" />
                        <rect x="5" y="5" width="4" height="4" fill="#000" />

                        <rect x="20" y="2" width="10" height="10" rx="1" />
                        <rect x="22" y="4" width="6" height="6" fill="#fff" />
                        <rect x="23" y="5" width="4" height="4" fill="#000" />

                        <rect x="2" y="20" width="10" height="10" rx="1" />
                        <rect x="4" y="22" width="6" height="6" fill="#fff" />
                        <rect x="5" y="23" width="4" height="4" fill="#000" />

                        <rect x="14" y="2" width="3" height="3" />
                        <rect x="14" y="8" width="3" height="3" />
                        <rect x="14" y="14" width="5" height="5" />
                        <rect x="20" y="14" width="3" height="3" />
                        <rect x="26" y="20" width="4" height="4" />
                        <rect x="14" y="22" width="3" height="3" />
                      </svg>
                    </div>
                  </div>

                  {/* Text details */}
                  <div className="min-w-0 text-left flex-1">
                    <p className="text-[9px] text-gray-500 font-semibold uppercase">Mã tài sản</p>
                    <p className="text-xs font-mono font-bold text-gray-900 tracking-tight">
                      HW-2026-00128
                    </p>

                    {data.showCategoryOnLabel && (
                      <p className="text-[10px] text-gray-600 truncate mt-1">
                        Laptop Dell Latitude 7420
                      </p>
                    )}

                    {data.showSerialNumberOnLabel && (
                      <p className="text-[9px] font-mono text-gray-500 mt-0.5 truncate">
                        S/N: 8FTX4R3
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer Sticker */}
                <div className="mt-2 pt-1 border-t border-gray-200 flex items-center justify-between text-[8px] text-gray-400 font-mono">
                  <span>aims.company.vn</span>
                  <span>Hotline: 1900 6868</span>
                </div>
              </div>

              <p className="text-[11px] text-gray-400 mt-4 text-center">
                Mẫu tem được tối ưu hóa cho máy in mã vạch chuyên dụng Xprinter, Zebra, Bixolon
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* ================= 2. CẤU HÌNH MẪU BIÊN BẢN BÀN GIAO ================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Cột trái: Cài đặt điều khoản & tiêu đề */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white dark:bg-gray-850 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Nội dung Biên bản Bàn giao Thiết bị
              </h4>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Tiêu đề chính văn bản
                </label>
                <input
                  type="text"
                  value={data.handoverTitle}
                  onChange={(e) => handleChange("handoverTitle", e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Căn cứ / Đoạn mở đầu
                </label>
                <textarea
                  rows={3}
                  value={data.handoverHeaderNote}
                  onChange={(e) => handleChange("handoverHeaderNote", e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Điều khoản cam kết sử dụng & bảo quản tài sản
                </label>
                <textarea
                  rows={4}
                  value={data.handoverTerms}
                  onChange={(e) => handleChange("handoverTerms", e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Chức danh Bên Giao
                  </label>
                  <input
                    type="text"
                    value={data.delivererSignTitle}
                    onChange={(e) => handleChange("delivererSignTitle", e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Chức danh Bên Nhận
                  </label>
                  <input
                    type="text"
                    value={data.receiverSignTitle}
                    onChange={(e) => handleChange("receiverSignTitle", e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Ghi chú chân trang (Footer Note)
                </label>
                <input
                  type="text"
                  value={data.footerNote}
                  onChange={(e) => handleChange("footerNote", e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Cột phải: Live Preview khổ giấy A4 mô phỏng */}
          <div className="lg:col-span-6">
            <div className="bg-slate-200 dark:bg-gray-950 p-4 rounded-2xl shadow-inner flex flex-col items-center">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                Xem trước trang in A4 chuẩn
              </span>

              <div className="w-full max-w-[500px] bg-white text-gray-900 p-6 rounded-lg shadow-xl text-[11px] leading-relaxed select-none font-serif">
                {/* Quốc hiệu tiêu ngữ */}
                <div className="text-center pb-3 border-b border-gray-300">
                  <p className="font-bold text-[10px] uppercase">{organizationName}</p>
                  <p className="font-bold text-xs uppercase tracking-wide mt-1">
                    CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                  </p>
                  <p className="text-[10px] italic">Độc lập - Tự do - Hạnh phúc</p>
                  <p className="text-[9px] italic mt-1">Hà Nội, ngày 29 tháng 09 năm 2026</p>
                </div>

                {/* Tiêu đề */}
                <div className="text-center my-4">
                  <h3 className="font-bold text-sm uppercase text-gray-900 tracking-wide font-sans">
                    {data.handoverTitle}
                  </h3>
                  <p className="text-[10px] text-gray-500 font-mono mt-0.5">Số: BB-2026/09/IT-0042</p>
                </div>

                {/* Căn cứ */}
                <p className="italic text-[10px] text-gray-600 mb-3">{data.handoverHeaderNote}</p>

                {/* Bảng danh sách thiết bị mẫu */}
                <table className="w-full border-collapse border border-gray-300 text-[10px] mb-3">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 p-1">STT</th>
                      <th className="border border-gray-300 p-1 text-left">Mã tài sản</th>
                      <th className="border border-gray-300 p-1 text-left">Tên thiết bị / Cấu hình</th>
                      <th className="border border-gray-300 p-1">S/N</th>
                      <th className="border border-gray-300 p-1">Tình trạng</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 p-1 text-center">1</td>
                      <td className="border border-gray-300 p-1 font-mono font-bold">HW-2026-00128</td>
                      <td className="border border-gray-300 p-1">Laptop Dell Latitude 7420 (Core i7, 16GB, 512GB)</td>
                      <td className="border border-gray-300 p-1 font-mono">8FTX4R3</td>
                      <td className="border border-gray-300 p-1 text-center">Mới 100%</td>
                    </tr>
                  </tbody>
                </table>

                {/* Cam kết */}
                <div className="mb-4">
                  <p className="font-bold text-[10px] uppercase mb-1">Cam kết của bên nhận:</p>
                  <p className="whitespace-pre-line text-[10px] text-gray-700 bg-gray-50 p-2 rounded border border-gray-200">
                    {data.handoverTerms}
                  </p>
                </div>

                {/* Chữ ký 2 bên */}
                <div className="grid grid-cols-2 gap-4 text-center mt-6 pt-4 border-t border-gray-200">
                  <div>
                    <p className="font-bold uppercase text-[10px]">{data.delivererSignTitle}</p>
                    <p className="italic text-[9px] text-gray-400 mt-0.5">(Ký và ghi rõ họ tên)</p>
                    <div className="h-12" />
                    <p className="font-bold text-[10px]">Trần Kỹ Thuật</p>
                  </div>

                  <div>
                    <p className="font-bold uppercase text-[10px]">{data.receiverSignTitle}</p>
                    <p className="italic text-[9px] text-gray-400 mt-0.5">(Ký và ghi rõ họ tên)</p>
                    <div className="h-12" />
                    <p className="font-bold text-[10px]">Nguyễn Nhân Viên</p>
                  </div>
                </div>

                <p className="text-[9px] italic text-gray-500 mt-4 text-center">{data.footerNote}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
