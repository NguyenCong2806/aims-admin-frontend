import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  MaintenanceTask,
  MaintenanceType,
  MaintenancePriority,
  MaintenanceStatus,
} from "../../../models/Maintenance/maintenancePlan";

interface MaintenanceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: MaintenanceTask | null;
  selectedDate?: string | null;
  onSave: (taskData: Partial<MaintenanceTask>) => void;
}

export const MaintenanceFormModal: React.FC<MaintenanceFormModalProps> = ({
  isOpen,
  onClose,
  initialData,
  selectedDate,
  onSave,
}) => {
  const [title, setTitle] = useState("");
  const [planCode, setPlanCode] = useState("");
  const [type, setType] = useState<MaintenanceType>("PREVENTIVE");
  const [priority, setPriority] = useState<MaintenancePriority>("MEDIUM");
  const [status, setStatus] = useState<MaintenanceStatus>("SCHEDULED");
  const [assetCode, setAssetCode] = useState("");
  const [assetName, setAssetName] = useState("");
  const [locationName, setLocationName] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [assignedTo, setAssignedTo] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [estimatedCost, setEstimatedCost] = useState<number>(0);
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setPlanCode(initialData.planCode || "");
      setType(initialData.type || "PREVENTIVE");
      setPriority(initialData.priority || "MEDIUM");
      setStatus(initialData.status || "SCHEDULED");
      setAssetCode(initialData.assetCode || "");
      setAssetName(initialData.assetName || "");
      setLocationName(initialData.locationName || "");
      setDepartmentName(initialData.departmentName || "");
      setStartDate(initialData.startDate || "");
      setEndDate(initialData.endDate || "");
      setStartTime(initialData.startTime || "09:00");
      setEndTime(initialData.endTime || "17:00");
      setAssignedTo(initialData.assignedTo || "");
      setVendorName(initialData.vendorName || "");
      setEstimatedCost(initialData.estimatedCost || 0);
      setDescription(initialData.description || "");
      setNotes(initialData.notes || "");
    } else {
      const defaultDate = selectedDate || new Date().toISOString().split("T")[0];
      setTitle("");
      setPlanCode(`MNT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
      setType("PREVENTIVE");
      setPriority("MEDIUM");
      setStatus("SCHEDULED");
      setAssetCode("HW-PC-0021");
      setAssetName("Máy trạm đồ họa TUF Gaming");
      setLocationName("Tòa nhà A - Tầng 4 (Phòng Dev)");
      setDepartmentName("Phòng Công nghệ & IT");
      setStartDate(defaultDate);
      setEndDate(defaultDate);
      setStartTime("09:00");
      setEndTime("17:00");
      setAssignedTo("KTV Nguyễn Văn Hoàng");
      setVendorName("Đội Kỹ thuật IT Nội bộ AIMS");
      setEstimatedCost(1000000);
      setDescription("");
      setNotes("");
    }
  }, [initialData, selectedDate, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Vui lòng nhập tiêu đề kế hoạch bảo trì!");
      return;
    }
    if (!startDate) {
      toast.error("Vui lòng chọn ngày thực hiện!");
      return;
    }

    onSave({
      id: initialData?.id,
      title: title.trim(),
      planCode: planCode.trim(),
      type,
      priority,
      status,
      assetCode: assetCode.trim(),
      assetName: assetName.trim(),
      locationName: locationName.trim(),
      departmentName: departmentName.trim(),
      startDate,
      endDate: endDate || startDate,
      startTime,
      endTime,
      assignedTo: assignedTo.trim(),
      vendorName: vendorName.trim(),
      estimatedCost: Number(estimatedCost) || 0,
      description: description.trim(),
      notes: notes.trim(),
      checklist: initialData?.checklist || [
        { id: "c1", text: "Kiểm tra tổng quan hiện trạng và nhật ký lỗi", completed: false },
        { id: "c2", text: "Thực hiện vệ sinh và bảo dưỡng kỹ thuật", completed: false },
        { id: "c3", text: "Kiểm tra hoạt động sau bảo trì & nghiệm thu", completed: false },
      ],
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-850">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              {initialData ? "Chỉnh sửa Kế hoạch Bảo trì" : "Lên Lịch Bảo trì Mới"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* FORM BODY */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* TITLE & PLAN CODE */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Tiêu đề công việc bảo trì <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Bảo dưỡng định kỳ máy chủ rack Tầng 4..."
                className="w-full h-10 px-3 text-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Mã kế hoạch
              </label>
              <input
                type="text"
                value={planCode}
                onChange={(e) => setPlanCode(e.target.value)}
                className="w-full h-10 px-3 text-sm font-mono rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* TYPE, PRIORITY & STATUS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Loại bảo trì
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as MaintenanceType)}
                className="w-full h-10 px-3 text-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="PREVENTIVE">🔄 Bảo trì định kỳ</option>
                <option value="CORRECTIVE">🔧 Sửa chữa sự cố</option>
                <option value="UPGRADE">⚡ Nâng cấp phần cứng</option>
                <option value="WARRANTY">🛡️ Bảo hành chính hãng</option>
                <option value="INSPECTION">📋 Kiểm định & Kiểm kê</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Mức độ ưu tiên
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as MaintenancePriority)}
                className="w-full h-10 px-3 text-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="LOW">Thấp (Low)</option>
                <option value="MEDIUM">Trung bình (Medium)</option>
                <option value="HIGH">Cao (High)</option>
                <option value="CRITICAL">Khẩn cấp (Critical)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Trạng thái
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as MaintenanceStatus)}
                className="w-full h-10 px-3 text-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="SCHEDULED">Chờ thực hiện</option>
                <option value="IN_PROGRESS">Đang tiến hành</option>
                <option value="COMPLETED">Đã hoàn thành</option>
                <option value="OVERDUE">Quá hạn xử lý</option>
                <option value="CANCELLED">Đã hủy / Hoãn</option>
              </select>
            </div>
          </div>

          {/* ASSET INFO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-800">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Mã thiết bị / Tài sản
              </label>
              <input
                type="text"
                value={assetCode}
                onChange={(e) => setAssetCode(e.target.value)}
                placeholder="VD: HW-PC-0021"
                className="w-full h-9 px-3 text-xs font-mono rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Tên thiết bị
              </label>
              <input
                type="text"
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
                placeholder="VD: Máy trạm đồ họa TUF Gaming..."
                className="w-full h-9 px-3 text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Vị trí lắp đặt
              </label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="VD: Phòng Server Tầng 4"
                className="w-full h-9 px-3 text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Phòng ban sử dụng
              </label>
              <input
                type="text"
                value={departmentName}
                onChange={(e) => setDepartmentName(e.target.value)}
                placeholder="VD: Phòng Công nghệ & IT"
                className="w-full h-9 px-3 text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* DATES & TIME */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Ngày bắt đầu <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full h-10 px-3 text-xs rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Ngày kết thúc
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full h-10 px-3 text-xs rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Giờ bắt đầu
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full h-10 px-3 text-xs rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Giờ kết thúc
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full h-10 px-3 text-xs rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* TECHNICIAN & COST */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Kỹ thuật viên phụ trách
              </label>
              <input
                type="text"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="VD: KTV Nguyễn Văn Hoàng"
                className="w-full h-10 px-3 text-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Đơn vị / Đối tác thực hiện
              </label>
              <input
                type="text"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                placeholder="VD: IT Nội bộ AIMS..."
                className="w-full h-10 px-3 text-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Chi phí dự toán (VNĐ)
              </label>
              <input
                type="number"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(Number(e.target.value))}
                step="50000"
                className="w-full h-10 px-3 text-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Mô tả nội dung & Quy trình bảo dưỡng
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Chi tiết các hạng mục cần thực hiện, tiêu chuẩn nghiệm thu..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
            />
          </div>

          {/* FOOTER BUTTONS */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 rounded-xl transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 rounded-xl transition"
            >
              {initialData ? "Lưu thay đổi" : "Tạo lịch bảo trì"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
