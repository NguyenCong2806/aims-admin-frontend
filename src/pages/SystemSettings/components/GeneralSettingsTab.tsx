import React from "react";
import { GeneralConfig } from "../../../models/SystemConfig/systemConfigModel";

interface GeneralSettingsTabProps {
  data: GeneralConfig;
  onChange: (updated: GeneralConfig) => void;
}

export const GeneralSettingsTab: React.FC<GeneralSettingsTabProps> = ({
  data,
  onChange,
}) => {
  const handleChange = <K extends keyof GeneralConfig>(
    field: K,
    value: GeneralConfig[K]
  ) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Thông tin Doanh nghiệp & Liên hệ */}
      <div className="bg-white dark:bg-gray-850 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg">
            🏢
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              Thông tin Doanh nghiệp & Đơn vị chủ quản
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Thông tin hiển thị trên tiêu đề hệ thống, phiếu xuất kho và biên bản bàn giao
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Tên doanh nghiệp / Đơn vị <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.organizationName}
              onChange={(e) => handleChange("organizationName", e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Mã số thuế / Mã định danh đơn vị
            </label>
            <input
              type="text"
              value={data.taxId}
              onChange={(e) => handleChange("taxId", e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Hotline hỗ trợ IT Helpdesk
            </label>
            <input
              type="text"
              value={data.hotline}
              onChange={(e) => handleChange("hotline", e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Email nhận ticket kỹ thuật IT
            </label>
            <input
              type="email"
              value={data.supportEmail}
              onChange={(e) => handleChange("supportEmail", e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Múi giờ hệ thống
            </label>
            <input
              type="text"
              disabled
              value={data.timezone}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-mono cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* 2. Quy tắc Định danh & Mã Tài sản tự động */}
      <div className="bg-white dark:bg-gray-850 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-lg">
            🏷️
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              Quy tắc Tiền tố & Sinh mã Tài sản tự động
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Quy chuẩn đặt tên mã Barcode/QR Code cho từng loại tài sản CNTT
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
            <div>
              <span className="text-xs font-bold text-gray-900 dark:text-white">
                Tự động sinh mã tài sản tăng dần khi nhập kho
              </span>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Khi bật, hệ thống tự động sinh số nhảy theo định dạng: [Tiền tố]-[Năm]-[Số thứ tự 5 chữ số] (VD: HW-2026-00042)
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={data.autoGenerateAssetCode}
                onChange={(e) => handleChange("autoGenerateAssetCode", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Tiền tố Thiết bị phần cứng
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={data.assetPrefixHardware}
                  onChange={(e) => handleChange("assetPrefixHardware", e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2 text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Mẫu: {data.assetPrefixHardware}2026-00128</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Tiền tố Tài nguyên số (Cloud/Domain)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={data.assetPrefixDigital}
                  onChange={(e) => handleChange("assetPrefixDigital", e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2 text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Mẫu: {data.assetPrefixDigital}2026-00015</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Tiền tố Bản quyền phần mềm (License)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={data.assetPrefixLicense}
                  onChange={(e) => handleChange("assetPrefixLicense", e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2 text-xs font-mono font-bold text-purple-600 dark:text-purple-400 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Mẫu: {data.assetPrefixLicense}2026-00049</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Tiền tệ, Khấu hao & Tải tệp */}
      <div className="bg-white dark:bg-gray-850 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg">
            💰
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              Tiền tệ & Chính sách Khấu hao Tài sản
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Tham số hạch toán chi phí Capex, Opex và giá trị còn lại theo thời gian
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Đơn vị tiền tệ chính
            </label>
            <select
              value={data.currency}
              onChange={(e) => handleChange("currency", e.target.value as GeneralConfig["currency"])}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="VND">VND (Việt Nam Đồng)</option>
              <option value="USD">USD (Đô la Mỹ)</option>
              <option value="EUR">EUR (Euro)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Phương pháp tính khấu hao ngầm định
            </label>
            <select
              value={data.depreciationMethodDefault}
              onChange={(e) => handleChange("depreciationMethodDefault", e.target.value as GeneralConfig["depreciationMethodDefault"])}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="STRAIGHT_LINE">Đường thẳng (Khấu hao đều từng tháng)</option>
              <option value="DECLINING_BALANCE">Số dư giảm dần (Khấu hao nhanh năm đầu)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Thời gian khấu hao tiêu chuẩn (Tháng)
            </label>
            <input
              type="number"
              min={6}
              max={120}
              value={data.defaultUsefulLifeMonths}
              onChange={(e) => handleChange("defaultUsefulLifeMonths", Number(e.target.value))}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
            />
            <p className="text-[10px] text-gray-400 mt-1">Tương đương {(data.defaultUsefulLifeMonths / 12).toFixed(1)} năm sử dụng</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Định dạng ngày tháng hiển thị
            </label>
            <select
              value={data.dateFormat}
              onChange={(e) => handleChange("dateFormat", e.target.value as GeneralConfig["dateFormat"])}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY (Chuẩn Việt Nam - 29/09/2026)</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD (Chuẩn Quốc tế - 2026-09-29)</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY (Chuẩn Mỹ - 09/29/2026)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Dung lượng tệp đính kèm tối đa (MB)
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={data.maxUploadFileSizeMb}
              onChange={(e) => handleChange("maxUploadFileSizeMb", Number(e.target.value))}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
