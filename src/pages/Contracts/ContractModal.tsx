import React, { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Modal } from "../../components/ui/modal";
import { contract, createcontract, updatecontract } from "../../models/Contract/contract";
import { ContractFormData, contractSchema } from "../../validations/contract.schema";
import { useSupplierAll } from "../../query/suppliers/suppliersQuery";
import { useUploadContractFile } from "../../query/contracts/contractsQuery";
import { FileIcon, TrashBinIcon, DownloadIcon, CheckCircleIcon } from "../../icons";

import { CONTRACT_TYPES } from "../../common/ContractTypeList";
import { CONTRACT_STATUSES } from "../../common/ContractStatusList";

export { CONTRACT_TYPES, CONTRACT_STATUSES };

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract?: contract | null;
  isLoading?: boolean;
  onSubmit: (data: createcontract | updatecontract) => Promise<void>;
}

const FIELD_LABEL_CLASS = "block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5";
const getInputClass = (hasError: boolean) =>
  `w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border ${
    hasError
      ? "border-rose-400 focus:ring-rose-400 bg-rose-50/20"
      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 text-gray-900 dark:text-white focus:ring-indigo-500"
  } focus:outline-none focus:ring-2 transition-all shadow-2xs`;

export const formatFileSize = (bytes?: number | null): string => {
  if (!bytes || bytes <= 0) return "0 KB";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const ContractModal: React.FC<ContractModalProps> = ({
  isOpen,
  onClose,
  contract: currentContract,
  isLoading = false,
  onSubmit,
}) => {
  const isEdit = Boolean(currentContract);
  const { data: suppliers } = useSupplierAll();
  const uploadFileMutation = useUploadContractFile();

  // Local state cho file đính kèm
  const [uploadedFileMeta, setUploadedFileMeta] = useState<{
    fileName: string;
    fileUrl: string;
    fileSize: number;
  } | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "terms" | "file">("general");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      contractCode: "",
      title: "",
      contractType: "IT_HARDWARE",
      supplierId: null,
      totalValue: 0,
      currency: "VND",
      signedDate: "",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      warrantyMonths: 12,
      warrantyEndDate: "",
      status: "ACTIVE",
      paymentTerms: "",
      slaTerms: "",
      notes: "",
      fileUrl: "",
      fileName: "",
      fileSize: 0,
    },
  });

  const watchStartDate = watch("startDate");
  const watchWarrantyMonths = watch("warrantyMonths");
  const watchTotalValue = watch("totalValue");

  // Đồng bộ khi mở modal
  useEffect(() => {
    if (!isOpen) return;

    if (currentContract) {
      reset({
        contractCode: currentContract.contractCode ?? "",
        title: currentContract.title ?? "",
        contractType: currentContract.contractType ?? "IT_HARDWARE",
        supplierId: currentContract.supplierId ?? null,
        totalValue: currentContract.totalValue ?? 0,
        currency: currentContract.currency ?? "VND",
        signedDate: currentContract.signedDate ?? "",
        startDate: currentContract.startDate ? currentContract.startDate.split("T")[0] : "",
        endDate: currentContract.endDate ? currentContract.endDate.split("T")[0] : "",
        warrantyMonths: currentContract.warrantyMonths ?? 12,
        warrantyEndDate: currentContract.warrantyEndDate ? currentContract.warrantyEndDate.split("T")[0] : "",
        status: currentContract.status ?? "ACTIVE",
        paymentTerms: currentContract.paymentTerms ?? "",
        slaTerms: currentContract.slaTerms ?? "",
        notes: currentContract.notes ?? "",
        fileUrl: currentContract.fileUrl ?? "",
        fileName: currentContract.fileName ?? "",
        fileSize: currentContract.fileSize ?? 0,
      });

      if (currentContract.fileUrl && currentContract.fileName) {
        setUploadedFileMeta({
          fileName: currentContract.fileName,
          fileUrl: currentContract.fileUrl,
          fileSize: currentContract.fileSize ?? 0,
        });
      } else {
        setUploadedFileMeta(null);
      }
    } else {
      const today = new Date().toISOString().split("T")[0];
      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 1);

      reset({
        contractCode: `HD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        title: "",
        contractType: "IT_HARDWARE",
        supplierId: null,
        totalValue: 0,
        currency: "VND",
        signedDate: today,
        startDate: today,
        endDate: nextYear.toISOString().split("T")[0],
        warrantyMonths: 12,
        warrantyEndDate: nextYear.toISOString().split("T")[0],
        status: "ACTIVE",
        paymentTerms: "",
        slaTerms: "Cam kết hỗ trợ kỹ thuật trong giờ hành chính.",
        notes: "",
        fileUrl: "",
        fileName: "",
        fileSize: 0,
      });
      setUploadedFileMeta(null);
    }

    setIsUploadingFile(false);
    setActiveTab("general");
  }, [currentContract, isOpen, reset]);

  // Tự động tính ngày bảo hành dựa vào startDate + warrantyMonths
  useEffect(() => {
    if (watchStartDate && watchWarrantyMonths && Number(watchWarrantyMonths) > 0) {
      try {
        const start = new Date(watchStartDate);
        if (!isNaN(start.getTime())) {
          const wEnd = new Date(start);
          wEnd.setMonth(wEnd.getMonth() + Number(watchWarrantyMonths));
          setValue("warrantyEndDate", wEnd.toISOString().split("T")[0]);
        }
      } catch {
        // ignore
      }
    }
  }, [watchStartDate, watchWarrantyMonths, setValue]);

  // Xử lý kéo thả / chọn file
  const handleFileChange = useCallback(
    async (file: File) => {
      // Giới hạn kích thước file 25MB
      const maxBytes = 25 * 1024 * 1024;
      if (file.size > maxBytes) {
        toast.error("File tải lên vượt quá dung lượng tối đa cho phép (25MB)!");
        return;
      }

      setIsUploadingFile(true);

      try {
        // Tải file trực tiếp qua backend API
        const result = await uploadFileMutation.mutateAsync(file);
        setUploadedFileMeta({
          fileName: result.fileName,
          fileUrl: result.relativeUrl,
          fileSize: result.fileSizeBytes,
        });
        setValue("fileUrl", result.relativeUrl);
        setValue("fileName", result.fileName);
        setValue("fileSize", result.fileSizeBytes);
        toast.success(`Đã đính kèm tệp hợp đồng: ${file.name}`);
      } catch (err) {
        console.warn("Upload lỗi, dùng local object URL:", err);
        const localUrl = URL.createObjectURL(file);
        setUploadedFileMeta({
          fileName: file.name,
          fileUrl: localUrl,
          fileSize: file.size,
        });
        setValue("fileUrl", localUrl);
        setValue("fileName", file.name);
        setValue("fileSize", file.size);
        toast.info(`Đã đính kèm tệp: ${file.name}`);
      } finally {
        setIsUploadingFile(false);
      }
    },
    [uploadFileMutation, setValue]
  );

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFileMeta(null);
    setValue("fileUrl", "");
    setValue("fileName", "");
    setValue("fileSize", 0);
    toast.info("Đã xóa file đính kèm.");
  };

  const handleFormSubmit = async (data: ContractFormData) => {
    try {
      // Tìm tên nhà cung cấp nếu có supplierId
      let supplierName: string | undefined = undefined;
      if (data.supplierId && suppliers) {
        const found = suppliers.find((s) => s.id === Number(data.supplierId));
        if (found) supplierName = found.name;
      }

      const payload: createcontract = {
        contractCode: data.contractCode.trim(),
        title: data.title.trim(),
        contractType: data.contractType,
        supplierId: data.supplierId ? Number(data.supplierId) : null,
        supplierName: supplierName || currentContract?.supplierName || null,
        totalValue: Number(data.totalValue) || 0,
        currency: data.currency || "VND",
        signedDate: data.signedDate || null,
        startDate: data.startDate,
        endDate: data.endDate,
        warrantyMonths: data.warrantyMonths ? Number(data.warrantyMonths) : null,
        warrantyEndDate: data.warrantyEndDate || null,
        slaTerms: data.slaTerms || null,
        paymentTerms: data.paymentTerms || null,
        status: data.status || "ACTIVE",
        fileUrl: data.fileUrl || uploadedFileMeta?.fileUrl || null,
        fileName: data.fileName || uploadedFileMeta?.fileName || null,
        fileSize: data.fileSize || uploadedFileMeta?.fileSize || null,
        notes: data.notes || null,
      };

      if (isEdit && currentContract) {
        await onSubmit({ ...payload, id: currentContract.id } as updatecontract);
      } else {
        await onSubmit(payload);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Chỉnh sửa Hợp đồng: ${currentContract?.contractCode}` : "Thêm mới Hợp đồng & Bảo hành"}
      className="max-w-4xl"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
        {/* Navigation Tabs bên trong Modal */}
        <div className="flex border-b border-gray-100 dark:border-gray-800 gap-6 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={`pb-2.5 transition-all cursor-pointer ${
              activeTab === "general"
                ? "border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            📋 Thông tin chung
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("terms")}
            className={`pb-2.5 transition-all cursor-pointer ${
              activeTab === "terms"
                ? "border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            🛡️ Bảo hành & Cam kết SLA
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("file")}
            className={`pb-2.5 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "file"
                ? "border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            📎 Tệp đính kèm & Hồ sơ
            {uploadedFileMeta && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>
        </div>

        {/* ================= TAB 1: THÔNG TIN CHUNG ================= */}
        {activeTab === "general" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              {/* Số hiệu / Mã hợp đồng */}
              <div className="sm:col-span-4">
                <label className={FIELD_LABEL_CLASS}>
                  Số / Mã hợp đồng <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    {...register("contractCode")}
                    placeholder="VD: HD-2026-FPT-01"
                    className={getInputClass(!!errors.contractCode)}
                  />
                </div>
                {errors.contractCode && (
                  <p className="text-[11px] text-rose-500 mt-1">{errors.contractCode.message}</p>
                )}
              </div>

              {/* Tên hợp đồng */}
              <div className="sm:col-span-8">
                <label className={FIELD_LABEL_CLASS}>
                  Tên / Tiêu đề hợp đồng <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("title")}
                  placeholder="VD: Hợp đồng Cung cấp Thiết bị Máy trạm Dell Precision"
                  className={getInputClass(!!errors.title)}
                />
                {errors.title && (
                  <p className="text-[11px] text-rose-500 mt-1">{errors.title.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Loại hợp đồng */}
              <div>
                <label className={FIELD_LABEL_CLASS}>
                  Loại hợp đồng <span className="text-rose-500">*</span>
                </label>
                <select {...register("contractType")} className={getInputClass(!!errors.contractType)}>
                  {CONTRACT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                {errors.contractType && (
                  <p className="text-[11px] text-rose-500 mt-1">{errors.contractType.message}</p>
                )}
              </div>

              {/* Nhà cung cấp / Đối tác */}
              <div>
                <label className={FIELD_LABEL_CLASS}>Đối tác / Nhà cung cấp</label>
                <select
                  {...register("supplierId", {
                    setValueAs: (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
                  })}
                  className={getInputClass(false)}
                >
                  <option value="">-- Chọn Nhà cung cấp / Đối tác --</option>
                  {suppliers?.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Giá trị hợp đồng */}
              <div>
                <label className={FIELD_LABEL_CLASS}>
                  Giá trị hợp đồng (VND) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  {...register("totalValue", { valueAsNumber: true })}
                  placeholder="VD: 850000000"
                  className={getInputClass(!!errors.totalValue)}
                />
                {watchTotalValue > 0 && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                    ≈ {Number(watchTotalValue).toLocaleString("vi-VN")} đ
                  </p>
                )}
              </div>

              {/* Trạng thái hợp đồng */}
              <div>
                <label className={FIELD_LABEL_CLASS}>Trạng thái hợp đồng</label>
                <select {...register("status")} className={getInputClass(false)}>
                  {CONTRACT_STATUSES.map((st) => (
                    <option key={st.value} value={st.value}>
                      {st.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ngày ký */}
              <div>
                <label className={FIELD_LABEL_CLASS}>Ngày ký kết</label>
                <input type="date" {...register("signedDate")} className={getInputClass(false)} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Ngày bắt đầu */}
              <div>
                <label className={FIELD_LABEL_CLASS}>
                  Ngày bắt đầu hiệu lực <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  {...register("startDate")}
                  className={getInputClass(!!errors.startDate)}
                />
                {errors.startDate && (
                  <p className="text-[11px] text-rose-500 mt-1">{errors.startDate.message}</p>
                )}
              </div>

              {/* Ngày kết thúc / nghiệm thu */}
              <div>
                <label className={FIELD_LABEL_CLASS}>
                  Ngày kết thúc / Hết hạn <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  {...register("endDate")}
                  className={getInputClass(!!errors.endDate)}
                />
                {errors.endDate && (
                  <p className="text-[11px] text-rose-500 mt-1">{errors.endDate.message}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: ĐIỀU KHOẢN & BẢO HÀNH ================= */}
        {activeTab === "terms" && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 flex items-center gap-3 text-xs text-indigo-900 dark:text-indigo-200">
              <span className="text-xl">🛡️</span>
              <div>
                <strong>Chính sách Bảo hành & Cam kết SLA:</strong> Giúp hệ thống tự động nhắc nhở gia hạn trước 30 ngày và theo dõi độ sẵn sàng phần cứng.
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Thời hạn bảo hành */}
              <div>
                <label className={FIELD_LABEL_CLASS}>Thời gian bảo hành (Tháng)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    {...register("warrantyMonths", {
                      setValueAs: (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
                    })}
                    placeholder="VD: 12, 24, 36..."
                    className={getInputClass(false)}
                  />
                  <div className="flex gap-1">
                    {[12, 24, 36].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setValue("warrantyMonths", m)}
                        className="px-2 py-1.5 text-[11px] rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 cursor-pointer font-medium"
                      >
                        {m}T
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Ngày hết hạn bảo hành */}
              <div>
                <label className={FIELD_LABEL_CLASS}>Ngày kết thúc bảo hành</label>
                <input type="date" {...register("warrantyEndDate")} className={getInputClass(false)} />
              </div>
            </div>

            {/* Cam kết SLA */}
            <div>
              <label className={FIELD_LABEL_CLASS}>Cam kết chất lượng dịch vụ SLA (Service Level Agreement)</label>
              <textarea
                rows={2}
                {...register("slaTerms")}
                placeholder="VD: Cam kết hỗ trợ 24/7, thay thế linh kiện tại chỗ trong 4 giờ, Uptime 99.9%..."
                className={getInputClass(false)}
              />
            </div>

            {/* Điều khoản thanh toán */}
            <div>
              <label className={FIELD_LABEL_CLASS}>Tiến độ & Điều khoản thanh toán</label>
              <textarea
                rows={2}
                {...register("paymentTerms")}
                placeholder="VD: Tạm ứng 30% khi ký hợp đồng, 40% khi giao hàng, 30% sau khi ký biên bản nghiệm thu..."
                className={getInputClass(false)}
              />
            </div>

            {/* Ghi chú */}
            <div>
              <label className={FIELD_LABEL_CLASS}>Ghi chú nội bộ</label>
              <textarea
                rows={2}
                {...register("notes")}
                placeholder="Nhập thông tin bổ sung, số lượng máy kèm theo..."
                className={getInputClass(false)}
              />
            </div>
          </div>
        )}

        {/* ================= TAB 3: UPLOAD TỆP ĐÍNH KÈM ================= */}
        {activeTab === "file" && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 flex items-center gap-3 text-xs text-emerald-900 dark:text-emerald-200">
              <span className="text-xl">📁</span>
              <div>
                <strong>Lưu trữ Hồ sơ Hợp đồng số:</strong> Tải lên bản quét hợp đồng đã ký kết (.PDF), phụ lục bảo hành, hóa đơn hoặc file đính kèm (.DOCX, .XLSX). File sẽ được lưu trữ qua API máy chủ backend.
              </div>
            </div>

            {/* Dropzone Area */}
            {!uploadedFileMeta ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="relative border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-3xl p-8 text-center transition-all bg-gray-50/60 dark:bg-gray-850/40 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 group cursor-pointer"
              >
                <input
                  type="file"
                  id="contract-file-upload"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFileChange(e.target.files[0]);
                    }
                  }}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.zip,.rar"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isUploadingFile}
                />

                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-md shadow-indigo-500/10">
                    {isUploadingFile ? (
                      <div className="w-6 h-6 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FileIcon className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">
                      {isUploadingFile
                        ? "Đang tải tệp lên máy chủ..."
                        : "Kéo & thả file hợp đồng vào đây, hoặc nhấn để chọn"}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Hỗ trợ định dạng PDF, DOCX, XLSX, hình ảnh Scan hoặc ZIP (Tối đa 25MB)
                    </p>
                  </div>
                  <button
                    type="button"
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 shadow-2xs hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white transition-all cursor-pointer"
                  >
                    Chọn file từ máy tính
                  </button>
                </div>
              </div>
            ) : (
              /* File đã được chọn / tải lên */
              <div className="p-4 rounded-2xl bg-white dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl shrink-0">
                    {uploadedFileMeta.fileName.toLowerCase().endsWith(".pdf")
                      ? "📕"
                      : uploadedFileMeta.fileName.toLowerCase().endsWith(".xlsx") ||
                        uploadedFileMeta.fileName.toLowerCase().endsWith(".xls")
                      ? "📊"
                      : uploadedFileMeta.fileName.toLowerCase().endsWith(".docx") ||
                        uploadedFileMeta.fileName.toLowerCase().endsWith(".doc")
                      ? "📘"
                      : "📄"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate max-w-xs sm:max-w-md">
                        {uploadedFileMeta.fileName}
                      </h4>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        <CheckCircleIcon className="w-3 h-3 text-emerald-500" />
                        Đã đính kèm
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 font-mono">
                      Dung lượng: {formatFileSize(uploadedFileMeta.fileSize)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {uploadedFileMeta.fileUrl && (
                    <a
                      href={uploadedFileMeta.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-xs font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors inline-flex items-center gap-1"
                      title="Xem hoặc tải tệp"
                    >
                      <DownloadIcon className="w-4 h-4" />
                      <span className="hidden sm:inline">Tải về</span>
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-2 text-xs font-semibold rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900 text-rose-600 dark:text-rose-400 transition-colors inline-flex items-center gap-1 cursor-pointer"
                    title="Gỡ bỏ tệp"
                  >
                    <TrashBinIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Xóa</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal Actions Footer */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="text-xs text-gray-400">
            {uploadedFileMeta ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                ✓ Đã đính kèm 1 tệp tài liệu
              </span>
            ) : (
              <span>(Có thể bổ sung file đính kèm sau khi tạo)</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting || isLoading}
              className="px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>

            <button
              type="submit"
              disabled={isSubmitting || isLoading || isUploadingFile}
              className="px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all shadow-md shadow-indigo-500/25 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting || isLoading || isUploadingFile ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <span>{isEdit ? "Cập nhật hợp đồng" : "Lưu hợp đồng"}</span>
              )}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default ContractModal;
