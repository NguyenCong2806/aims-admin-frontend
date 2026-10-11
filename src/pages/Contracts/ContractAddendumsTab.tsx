import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ContractAddendum,
  CreateContractAddendum,
  contract,
} from "../../models/Contract/contract";
import {
  useContractAddendums,
  useCreateContractAddendum,
  useUpdateContractAddendum,
  useDeleteContractAddendum,
} from "../../query/contracts/contractAddendumsQuery";
import {
  contractAddendumSchema,
  ContractAddendumInput,
  ContractAddendumFormData,
} from "../../validations/contractAddendum.schema";
import { FileUpload, FileUploadResult } from "../../components/common/FileUpload";
import { services } from "../../di/ServiceContainer";
import { Modal } from "../../components/ui/modal";
import {
  FileIcon,
  DownloadIcon,
  PencilIcon,
  TrashBinIcon,
  PlusIcon,
} from "../../icons";
import Swal from "sweetalert2";
import { toast } from "sonner";

interface ContractAddendumsTabProps {
  contract: contract | null;
}

export const ADDENDUM_TYPES = [
  { value: "RENEWAL", label: "🔄 Gia hạn thời gian", badge: "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800" },
  { value: "SCOPE_EXPANSION", label: "📦 Mở rộng phạm vi / Thiết bị", badge: "bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800" },
  { value: "PRICE_ADJUSTMENT", label: "💰 Điều chỉnh đơn giá / Chu kỳ", badge: "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800" },
  { value: "TECHNICAL_CHANGE", label: "⚙️ Thay đổi kỹ thuật & SLA", badge: "bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800" },
  { value: "OTHER", label: "📄 Phụ lục bổ sung khác", badge: "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700" },
] as const;

export const ContractAddendumsTab: React.FC<ContractAddendumsTabProps> = ({ contract }) => {
  const contractId = contract?.id;

  // Query danh sách phụ lục
  const { data: serverAddendums = [], isLoading, refetch } = useContractAddendums(contractId);
  const addendums: ContractAddendum[] = serverAddendums.length > 0
    ? serverAddendums
    : (contract?.addendums || []);

  const createMutation = useCreateContractAddendum();
  const updateMutation = useUpdateContractAddendum();
  const deleteMutation = useDeleteContractAddendum();

  // State quản lý Modal Thêm/Sửa Phụ lục
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddendum, setEditingAddendum] = useState<ContractAddendum | null>(null);
  const [uploadedFileMeta, setUploadedFileMeta] = useState<{
    fileName: string;
    fileUrl: string;
    fileSize: number;
  } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ContractAddendumInput, any, ContractAddendumFormData>({
    resolver: zodResolver(contractAddendumSchema),
    defaultValues: {
      addendumNumber: "",
      title: "",
      addendumType: "RENEWAL",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      renewalAlertDate: "",
      cyclePeriodMonths: 12,
      unitPricePerMonth: 0,
      totalPeriodAmount: 0,
      documentFileUrl: "",
      status: "ACTIVE",
      notes: "",
    },
  });

  const watchCycleMonths = watch("cyclePeriodMonths");
  const watchUnitPrice = watch("unitPricePerMonth");
  const watchDocUrl = watch("documentFileUrl");

  // Tự động tính tổng tiền chu kỳ khi thay đổi số tháng hoặc đơn giá tháng
  React.useEffect(() => {
    const months = Number(watchCycleMonths) || 0;
    const price = Number(watchUnitPrice) || 0;
    if (months > 0 && price > 0) {
      setValue("totalPeriodAmount", months * price, { shouldValidate: true });
    }
  }, [watchCycleMonths, watchUnitPrice, setValue]);

  // Mở modal tạo mới
  const handleOpenCreate = () => {
    if (!contractId) return;
    setEditingAddendum(null);
    setUploadedFileMeta(null);

    const nextIndex = addendums.length + 1;
    const codePrefix = contract?.contractNumber || contract?.contractCode || `HD-${contractId}`;
    const today = new Date().toISOString().split("T")[0];
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);

    reset({
      addendumNumber: `PL-${String(nextIndex).padStart(2, "0")}/${codePrefix}`,
      title: `Phụ lục gia hạn đợt ${nextIndex}`,
      addendumType: "RENEWAL",
      startDate: today,
      endDate: nextYear.toISOString().split("T")[0],
      renewalAlertDate: "",
      cyclePeriodMonths: 12,
      unitPricePerMonth: 0,
      totalPeriodAmount: 0,
      documentFileUrl: "",
      status: "ACTIVE",
      notes: "",
    });
    setIsModalOpen(true);
  };

  // Mở modal chỉnh sửa
  const handleOpenEdit = (item: ContractAddendum) => {
    setEditingAddendum(item);
    const docUrl = item.documentFileUrl || "";
    if (docUrl) {
      setUploadedFileMeta({
        fileName: item.fileName || docUrl.split("/").pop() || "PhuLuc.pdf",
        fileUrl: docUrl,
        fileSize: 0,
      });
    } else {
      setUploadedFileMeta(null);
    }

    reset({
      addendumNumber: item.addendumNumber,
      title: item.title,
      addendumType: item.addendumType || "RENEWAL",
      startDate: item.startDate ? item.startDate.split("T")[0] : "",
      endDate: item.endDate ? item.endDate.split("T")[0] : "",
      renewalAlertDate: item.renewalAlertDate ? item.renewalAlertDate.split("T")[0] : "",
      cyclePeriodMonths: item.cyclePeriodMonths ?? 12,
      unitPricePerMonth: item.unitPricePerMonth ?? 0,
      totalPeriodAmount: item.totalPeriodAmount ?? 0,
      documentFileUrl: docUrl,
      status: item.status || "ACTIVE",
      notes: item.notes || "",
    });
    setIsModalOpen(true);
  };

  const onAddendumError = (fieldErrors: any) => {
    console.warn("Lỗi xác thực phụ lục:", fieldErrors);
    const errorKeys = Object.keys(fieldErrors);
    if (errorKeys.length > 0) {
      const firstKey = errorKeys[0];
      const firstError = fieldErrors[firstKey];
      toast.error(`Vui lòng kiểm tra: ${firstError?.message || "Thông tin phụ lục chưa hợp lệ"}`);
    }
  };

  // Lưu phụ lục (Create / Update)
  const handleSaveAddendum = async (data: ContractAddendumFormData) => {
    if (!contractId) return;

    try {
      const payload: CreateContractAddendum = {
        contractId,
        addendumNumber: data.addendumNumber.trim(),
        title: data.title.trim(),
        addendumType: data.addendumType || "RENEWAL",
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
        renewalAlertDate: data.renewalAlertDate ? new Date(data.renewalAlertDate).toISOString() : null,
        cyclePeriodMonths:
          typeof data.cyclePeriodMonths === "number"
            ? data.cyclePeriodMonths
            : data.cyclePeriodMonths
            ? Number(data.cyclePeriodMonths)
            : null,
        unitPricePerMonth:
          typeof data.unitPricePerMonth === "number"
            ? data.unitPricePerMonth
            : data.unitPricePerMonth
            ? Number(data.unitPricePerMonth)
            : null,
        totalPeriodAmount:
          typeof data.totalPeriodAmount === "number"
            ? data.totalPeriodAmount
            : data.totalPeriodAmount
            ? Number(data.totalPeriodAmount)
            : null,
        documentFileUrl: data.documentFileUrl?.trim() || null,
        status: data.status || "ACTIVE",
        notes: data.notes?.trim() || null,
      };

      if (editingAddendum?.id) {
        await updateMutation.mutateAsync({
          id: editingAddendum.id,
          payload: { ...payload, id: editingAddendum.id },
        });
        toast.success(`Cập nhật phụ lục ${data.addendumNumber} thành công!`);
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(`Thêm mới phụ lục ${data.addendumNumber} thành công!`);
      }

      setIsModalOpen(false);
      refetch();
    } catch (err: any) {
      console.error("Lỗi khi lưu phụ lục:", err);
      toast.error(err?.response?.data?.message || "Không thể lưu phụ lục hợp đồng.");
    }
  };

  // Xóa phụ lục
  const handleDeleteAddendum = async (item: ContractAddendum) => {
    if (!contractId || !item.id) return;

    const result = await Swal.fire({
      title: "Xác nhận xóa phụ lục?",
      html: `Bạn có chắc muốn xóa phụ lục <b class="text-rose-600 font-mono">${item.addendumNumber}</b> (${item.title})?<br><span class="text-xs text-gray-500">Hành động này không thể hoàn tác.</span>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Đồng ý xóa",
      cancelButtonText: "Hủy bỏ",
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#64748b",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      await deleteMutation.mutateAsync({ id: item.id, contractId });
      toast.success("Đã xóa phụ lục thành công!");
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Lỗi khi xóa phụ lục.");
    }
  };

  // Tính tổng giá trị tất cả các phụ lục
  const totalAddendumsAmount = addendums.reduce(
    (sum, a) => sum + (Number(a.totalPeriodAmount) || 0),
    0
  );

  if (!contractId) {
    return (
      <div className="py-12 text-center space-y-3">
        <div className="text-4xl">📑</div>
        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">
          Chưa lưu Hợp đồng gốc
        </h4>
        <p className="text-xs text-gray-500 max-w-md mx-auto">
          Vui lòng điền thông tin và bấm <strong>"Lưu hợp đồng"</strong> trước để hệ thống cấp mã hợp đồng, sau đó bạn có thể quản lý các Phụ lục gia hạn và chu kỳ thanh toán tại đây.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Thẻ tóm tắt và nút hành động */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50/80 via-purple-50/50 to-blue-50/80 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-blue-950/40 border border-indigo-100/80 dark:border-indigo-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-gray-900 dark:text-white">
              Phụ lục Hợp đồng ({addendums.length})
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-semibold font-mono">
              Tổng PL: {totalAddendumsAmount.toLocaleString("vi-VN")} đ
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Quản lý các đợt gia hạn hiệu lực, chu kỳ thanh toán định kỳ, đơn giá tháng và file scan phụ lục.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Thêm Phụ lục mới</span>
        </button>
      </div>

      {/* Danh sách phụ lục */}
      {isLoading ? (
        <div className="py-10 text-center text-xs text-gray-400">
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Đang tải danh sách phụ lục...
        </div>
      ) : addendums.length === 0 ? (
        <div className="py-12 text-center rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40 space-y-2">
          <div className="text-3xl">📄</div>
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">
            Hợp đồng này chưa có phụ lục nào
          </p>
          <p className="text-[11px] text-gray-400">
            Bấm "Thêm Phụ lục mới" ở trên để bổ sung phụ lục gia hạn hoặc điều chỉnh chu kỳ.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {addendums.map((item) => {
            const typeConfig =
              ADDENDUM_TYPES.find((t) => t.value === item.addendumType) ||
              ADDENDUM_TYPES[0];
            const docUrl = item.documentFileUrl;
            const docName = item.fileName || (docUrl ? docUrl.split("/").pop() : "TaiLieuPhuLuc.pdf");
            const startStr = item.startDate ? item.startDate.split("T")[0] : "—";
            const endStr = item.endDate ? item.endDate.split("T")[0] : "—";
            const alertStr = item.renewalAlertDate ? item.renewalAlertDate.split("T")[0] : null;

            return (
              <div
                key={item.id || item.addendumNumber}
                className="p-4 rounded-2xl bg-white dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1 min-w-0">
                  {/* Dòng 1: Số hiệu + Loại phụ lục + Tiêu đề */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-lg border border-indigo-200/60 dark:border-indigo-800/60">
                      {item.addendumNumber}
                    </span>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${typeConfig.badge}`}
                    >
                      {typeConfig.label}
                    </span>
                    <h5 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white truncate">
                      {item.title}
                    </h5>
                  </div>

                  {/* Dòng 2: Thời hạn + Cảnh báo gia hạn + Tài chính chu kỳ */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-1 font-mono text-[11px]">
                      <span className="text-gray-400">Hiệu lực:</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        {startStr} &rarr; {endStr}
                      </span>
                    </div>

                    {alertStr && (
                      <div className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                        <span>⏰ Báo gia hạn:</span>
                        <span className="font-mono">{alertStr}</span>
                      </div>
                    )}

                    {item.cyclePeriodMonths ? (
                      <div className="flex items-center gap-1 text-[11px] text-purple-600 dark:text-purple-400 font-medium">
                        <span>🔄 Chu kỳ:</span>
                        <span>{item.cyclePeriodMonths} tháng</span>
                      </div>
                    ) : null}

                    {item.unitPricePerMonth ? (
                      <div className="flex items-center gap-1 text-[11px] text-gray-500 font-mono">
                        <span>Đơn giá/tháng:</span>
                        <span>{Number(item.unitPricePerMonth).toLocaleString("vi-VN")} đ</span>
                      </div>
                    ) : null}

                    <div className="flex items-center gap-1 text-[11px]">
                      <span className="text-gray-400">Tổng tiền:</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {Number(item.totalPeriodAmount || 0).toLocaleString("vi-VN")} đ
                      </span>
                    </div>
                  </div>

                  {item.notes && (
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 italic line-clamp-1">
                      Ghi chú: {item.notes}
                    </p>
                  )}
                </div>

                {/* Cột phải: File đính kèm & Nút thao tác */}
                <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-gray-100 dark:border-gray-700">
                  {docUrl ? (
                    <button
                      type="button"
                      onClick={() => services.file.downloadFile(docUrl, docName)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-gray-100 hover:bg-indigo-50 dark:bg-gray-800 dark:hover:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 transition-colors cursor-pointer"
                      title={`Tải xuống tài liệu: ${docName}`}
                    >
                      <FileIcon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate max-w-[100px] text-[11px]">{docName}</span>
                      <DownloadIcon className="w-3 h-3 text-gray-400 shrink-0" />
                    </button>
                  ) : (
                    <span className="text-[11px] text-gray-400 italic">Chưa có file</span>
                  )}

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
                    title="Chỉnh sửa phụ lục"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteAddendum(item)}
                    className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                    title="Xóa phụ lục"
                  >
                    <TrashBinIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= MODAL THÊM / SỬA PHỤ LỤC ================= */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAddendum ? `Chỉnh sửa Phụ lục: ${editingAddendum.addendumNumber}` : "Thêm mới Phụ lục Hợp đồng"}
        className="max-w-3xl w-full"
      >
        <form onSubmit={handleSubmit(handleSaveAddendum, onAddendumError)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* Số phụ lục */}
            <div className="sm:col-span-5">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Số hiệu phụ lục (AddendumNumber) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                {...register("addendumNumber")}
                placeholder="VD: PL-01/HD-2026"
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              {errors.addendumNumber && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.addendumNumber.message}</p>
              )}
            </div>

            {/* Tiêu đề phụ lục */}
            <div className="sm:col-span-7">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Tiêu đề phụ lục (Title) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                {...register("title")}
                placeholder="VD: Gia hạn thời gian bảo trì hệ thống năm 2027"
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              {errors.title && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.title.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Loại phụ lục */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Loại phụ lục (AddendumType)
              </label>
              <select
                {...register("addendumType")}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                {ADDENDUM_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Trạng thái */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Trạng thái (Status)
              </label>
              <select
                {...register("status")}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="ACTIVE">Đang có hiệu lực (ACTIVE)</option>
                <option value="DRAFT">Bản nháp (DRAFT)</option>
                <option value="EXPIRED">Đã hết hiệu lực (EXPIRED)</option>
                <option value="TERMINATED">Đã chấm dứt (TERMINATED)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Ngày bắt đầu */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Ngày bắt đầu (StartDate) <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                {...register("startDate")}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              {errors.startDate && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.startDate.message}</p>
              )}
            </div>

            {/* Ngày kết thúc */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Ngày kết thúc (EndDate) <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                {...register("endDate")}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              {errors.endDate && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.endDate.message}</p>
              )}
            </div>

            {/* Ngày cảnh báo gia hạn */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Cảnh báo tái ký (RenewalAlertDate)
              </label>
              <input
                type="date"
                {...register("renewalAlertDate")}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* Khối quản lý chu kỳ thanh toán & đơn giá */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 space-y-3">
            <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
              <span>💳</span> Quản lý Chu kỳ thanh toán & Tài chính
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Chu kỳ (CyclePeriodMonths)
                </label>
                <input
                  type="number"
                  {...register("cyclePeriodMonths", { valueAsNumber: true })}
                  placeholder="VD: 12"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Đơn giá / tháng (UnitPricePerMonth)
                </label>
                <input
                  type="number"
                  {...register("unitPricePerMonth", { valueAsNumber: true })}
                  placeholder="VD: 5000000"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Tổng tiền chu kỳ (TotalPeriodAmount)
                </label>
                <input
                  type="number"
                  {...register("totalPeriodAmount", { valueAsNumber: true })}
                  placeholder="VD: 60000000"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50/30 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 font-mono font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Upload file đính kèm văn bản phụ lục */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Tài liệu phụ lục đính kèm (DocumentFileUrl)
            </label>
            <input type="hidden" {...register("documentFileUrl")} />
            <FileUpload
              value={
                uploadedFileMeta
                  ? {
                      fileName: uploadedFileMeta.fileName,
                      storedFileName: uploadedFileMeta.fileName,
                      relativeUrl: uploadedFileMeta.fileUrl,
                      fileSizeBytes: uploadedFileMeta.fileSize,
                      contentType: "",
                    }
                  : watchDocUrl
                  ? {
                      fileName: watchDocUrl.split("/").pop() || "PhuLuc.pdf",
                      storedFileName: watchDocUrl.split("/").pop() || "PhuLuc.pdf",
                      relativeUrl: watchDocUrl,
                      fileSizeBytes: 0,
                      contentType: "",
                    }
                  : null
              }
              multiple={false}
              autoUpload={true}
              variant="compact"
              deletePhysicalOnRemove={true}
              onUploadSuccess={(res) => {
                const item = Array.isArray(res) ? res[0] : res;
                if (item) {
                  setUploadedFileMeta({
                    fileName: item.fileName,
                    fileUrl: item.relativeUrl,
                    fileSize: item.fileSizeBytes,
                  });
                  setValue("documentFileUrl", item.relativeUrl, { shouldValidate: true });
                }
              }}
              onChange={(res: FileUploadResult | null) => {
                if (res) {
                  setUploadedFileMeta({
                    fileName: res.fileName,
                    fileUrl: res.relativeUrl,
                    fileSize: res.fileSizeBytes,
                  });
                  setValue("documentFileUrl", res.relativeUrl, { shouldValidate: true });
                } else {
                  setUploadedFileMeta(null);
                  setValue("documentFileUrl", "", { shouldValidate: true });
                }
              }}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.zip"
              maxSizeMB={25}
              hint="Tải lên tệp scan văn bản phụ lục đã ký (PDF/Docx/ZIP)"
            />
          </div>

          {/* Ghi chú */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Ghi chú nội bộ (Notes)
            </label>
            <textarea
              rows={2}
              {...register("notes")}
              placeholder="Ghi chú chi tiết phạm vi bổ sung hoặc điều khoản thanh toán phụ lục..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          {/* Footer nút hành động */}
          <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              {isSubmitting ? "Đang lưu..." : editingAddendum ? "Cập nhật phụ lục" : "Lưu phụ lục"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
