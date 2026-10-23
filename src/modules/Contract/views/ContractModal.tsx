import React, { useEffect, useState } from "react";
import { useForm, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Modal } from "../../../components/ui/modal";
import { contract, createcontract, updatecontract } from "../models/contract";
import { ContractFormData, ContractInput, contractSchema } from "../../../validations/contract.schema";
import { useSupplierAll } from "../../Lookups/queries/suppliersQuery";
import { FileUpload } from "../../../components/common/FileUpload";

import { CONTRACT_TYPES } from "../../../common/ContractTypeList";
import { CONTRACT_STATUSES } from "../../../common/ContractStatusList";
import { ContractAddendumsTab } from "./ContractAddendumsTab";

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

const ContractModal: React.FC<ContractModalProps> = ({
  isOpen,
  onClose,
  contract: currentContract,
  isLoading = false,
  onSubmit,
}) => {
  const isEdit = Boolean(currentContract);
  const { data: suppliers } = useSupplierAll();

  // Local state cho file đính kèm hiển thị
  const [uploadedFileMeta, setUploadedFileMeta] = useState<{
    fileName: string;
    fileUrl: string;
    fileSize: number;
  } | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "terms" | "file" | "addendums">("general");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ContractInput, Record<string, unknown>, ContractFormData>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      contractNumber: "",
      title: "",
      contractType: "SERVICE_MAINTENANCE",
      supplierId: null,
      totalValue: 0,
      currency: "VND",
      signedDate: "",
      effectiveDate: new Date().toISOString().split("T")[0],
      expiryDate: "",
      status: "ACTIVE",
      paymentTerms: "",
      documentFileUrl: "",
      notes: "",
    },
  });

  const watchTotalValue = watch("totalValue");
  const watchDocumentFileUrl = watch("documentFileUrl");

  // Đồng bộ dữ liệu khi mở modal
  useEffect(() => {
    if (!isOpen) return;

    if (currentContract) {
      const contractNum = currentContract.contractNumber || currentContract.contractCode || "";
      const effDate = currentContract.effectiveDate
        ? currentContract.effectiveDate.split("T")[0]
        : currentContract.startDate
        ? currentContract.startDate.split("T")[0]
        : "";
      const expDate = currentContract.expiryDate
        ? currentContract.expiryDate.split("T")[0]
        : currentContract.endDate
        ? currentContract.endDate.split("T")[0]
        : "";
      const signDate = currentContract.signedDate ? currentContract.signedDate.split("T")[0] : "";
      const docUrl = currentContract.documentFileUrl || currentContract.fileUrl || "";

      reset({
        contractNumber: contractNum,
        title: currentContract.title ?? "",
        contractType: currentContract.contractType ?? "SERVICE_MAINTENANCE",
        supplierId: currentContract.supplierId ?? null,
        totalValue: currentContract.totalValue ?? 0,
        currency: currentContract.currency ?? "VND",
        signedDate: signDate,
        effectiveDate: effDate,
        expiryDate: expDate,
        status: currentContract.status ?? "ACTIVE",
        paymentTerms: currentContract.paymentTerms ?? "",
        documentFileUrl: docUrl,
        notes: currentContract.notes ?? "",
      });

      if (docUrl) {
        const extractedName = currentContract.fileName || docUrl.split("/").pop() || "TaiLieuHopDong.pdf";
        setUploadedFileMeta({
          fileName: extractedName,
          fileUrl: docUrl,
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
        contractNumber: `HD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        title: "",
        contractType: "SERVICE_MAINTENANCE",
        supplierId: null,
        totalValue: 0,
        currency: "VND",
        signedDate: today,
        effectiveDate: today,
        expiryDate: nextYear.toISOString().split("T")[0],
        status: "ACTIVE",
        paymentTerms: "",
        documentFileUrl: "",
        notes: "",
      });
      setUploadedFileMeta(null);
    }

    setIsUploadingFile(false);
    setActiveTab("general");
  }, [currentContract, isOpen, reset]);

  /**
   * Xử lý gửi Form lên Server:
   * File đã được upload trước qua /files/upload và trả về URL được lưu vào `documentFileUrl`.
   * Form sẽ đóng gói chuỗi JSON chuẩn theo đúng C# Entity Contract gửi về backend.
   */
  const handleFormSubmit = async (data: ContractFormData) => {
    try {
      const payload: createcontract = {
        contractNumber: data.contractNumber.trim(),
        title: data.title.trim(),
        contractType: data.contractType || "SERVICE_MAINTENANCE",
        supplierId: data.supplierId ? Number(data.supplierId) : null,
        totalValue: Number(data.totalValue) || 0,
        currency: data.currency || "VND",
        signedDate: data.signedDate ? new Date(data.signedDate).toISOString() : null,
        effectiveDate: new Date(data.effectiveDate).toISOString(),
        expiryDate: new Date(data.expiryDate).toISOString(),
        paymentTerms: data.paymentTerms?.trim() || null,
        documentFileUrl: data.documentFileUrl?.trim() || null,
        status: data.status || "ACTIVE",
        notes: data.notes?.trim() || null,

        // Cung cấp thêm bí danh tương thích nếu backend đọc model cũ
        contractCode: data.contractNumber.trim(),
        startDate: data.effectiveDate,
        endDate: data.expiryDate,
        fileUrl: data.documentFileUrl?.trim() || null,
      };

      if (isEdit && currentContract) {
        await onSubmit({ ...payload, id: currentContract.id } as updatecontract);
      } else {
        await onSubmit(payload);
      }
    } catch (err: unknown) {
      console.error("Lỗi khi lưu hợp đồng:", err);
      const errMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err instanceof Error ? err.message : "Đã xảy ra lỗi khi lưu hợp đồng.");
      toast.error(errMsg);
    }
  };

  const onFormError = (fieldErrors: FieldErrors<ContractInput>) => {
    console.warn("Lỗi xác thực form Hợp đồng:", fieldErrors);
    const errorKeys = Object.keys(fieldErrors) as (keyof ContractInput)[];
    if (errorKeys.length > 0) {
      const firstKey = String(errorKeys[0]);
      const firstError = fieldErrors[errorKeys[0]];
      toast.error(`Vui lòng kiểm tra: ${firstError?.message || "Dữ liệu hợp đồng chưa hợp lệ"}`);

      // Tự động chuyển tab đến trường bị lỗi để người dùng thấy ngay
      if (
        [
          "contractNumber",
          "title",
          "contractType",
          "supplierId",
          "totalValue",
          "currency",
          "signedDate",
          "effectiveDate",
          "expiryDate",
        ].includes(firstKey)
      ) {
        setActiveTab("general");
      } else if (["paymentTerms", "notes"].includes(firstKey)) {
        setActiveTab("terms");
      } else if (["documentFileUrl"].includes(firstKey)) {
        setActiveTab("file");
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isEdit
          ? `Chỉnh sửa Hợp đồng: ${currentContract?.contractNumber || currentContract?.contractCode}`
          : "Thêm mới Hợp đồng & Hồ sơ"
      }
      className="max-w-4xl lg:max-w-5xl w-full"
    >
      <div className="space-y-5">
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
            📝 Điều khoản & Ghi chú
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
            📎 Tài liệu hợp đồng (DocumentFileUrl)
            {(uploadedFileMeta || watchDocumentFileUrl) && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>
          {isEdit && (
            <button
              type="button"
              onClick={() => setActiveTab("addendums")}
              className={`pb-2.5 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "addendums"
                  ? "border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              📑 Phụ lục hợp đồng
              {currentContract?.addendums && currentContract.addendums.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold font-mono">
                  {currentContract.addendums.length}
                </span>
              )}
            </button>
          )}
        </div>

        {/* ================= TAB 4: PHỤ LỤC HỢP ĐỒNG (Hoàn toàn độc lập ngoài thẻ form) ================= */}
        {activeTab === "addendums" ? (
          <div className="space-y-4">
            <ContractAddendumsTab contract={currentContract || null} />
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        ) : (
          /* ================= TABS 1, 2, 3: FORM HỢP ĐỒNG ================= */
          <form onSubmit={handleSubmit(handleFormSubmit, onFormError)} className="space-y-5">

        {/* ================= TAB 1: THÔNG TIN CHUNG ================= */}
        {activeTab === "general" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              {/* Số hiệu / Mã hợp đồng (ContractNumber) */}
              <div className="sm:col-span-4">
                <label className={FIELD_LABEL_CLASS}>
                  Số hợp đồng (ContractNumber) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    {...register("contractNumber")}
                    placeholder="VD: HD-2026-FPT-01"
                    className={getInputClass(!!errors.contractNumber)}
                  />
                </div>
                {errors.contractNumber && (
                  <p className="text-[11px] text-rose-500 mt-1">{errors.contractNumber.message}</p>
                )}
              </div>

              {/* Tên / Tiêu đề hợp đồng (Title) */}
              <div className="sm:col-span-8">
                <label className={FIELD_LABEL_CLASS}>
                  Tên / Tiêu đề hợp đồng (Title) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("title")}
                  placeholder="VD: Hợp đồng Cung cấp Dịch vụ Bảo trì Hệ thống Máy chủ"
                  className={getInputClass(!!errors.title)}
                />
                {errors.title && (
                  <p className="text-[11px] text-rose-500 mt-1">{errors.title.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Loại hợp đồng (ContractType) */}
              <div>
                <label className={FIELD_LABEL_CLASS}>
                  Loại hợp đồng (ContractType) <span className="text-rose-500">*</span>
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

              {/* Nhà cung cấp / Đối tác (SupplierId) */}
              <div>
                <label className={FIELD_LABEL_CLASS}>Đối tác / Nhà cung cấp (SupplierId)</label>
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
              {/* Giá trị hợp đồng (TotalValue) */}
              <div>
                <label className={FIELD_LABEL_CLASS}>
                  Giá trị hợp đồng (TotalValue) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  {...register("totalValue", { valueAsNumber: true })}
                  placeholder="VD: 850000000"
                  className={getInputClass(!!errors.totalValue)}
                />
                {Number(watchTotalValue) > 0 && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                    ≈ {Number(watchTotalValue).toLocaleString("vi-VN")} đ
                  </p>
                )}
                {errors.totalValue && (
                  <p className="text-[11px] text-rose-500 mt-1">{errors.totalValue.message}</p>
                )}
              </div>

              {/* Loại tiền tệ (Currency) */}
              <div>
                <label className={FIELD_LABEL_CLASS}>Loại tiền tệ (Currency)</label>
                <input
                  type="text"
                  {...register("currency")}
                  placeholder="VND"
                  className={getInputClass(!!errors.currency)}
                />
                {errors.currency && (
                  <p className="text-[11px] text-rose-500 mt-1">{errors.currency.message}</p>
                )}
              </div>

              {/* Trạng thái hợp đồng (Status) */}
              <div>
                <label className={FIELD_LABEL_CLASS}>Trạng thái hợp đồng (Status)</label>
                <select {...register("status")} className={getInputClass(false)}>
                  {CONTRACT_STATUSES.map((st) => (
                    <option key={st.value} value={st.value}>
                      {st.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Ngày ký kết (SignedDate) */}
              <div>
                <label className={FIELD_LABEL_CLASS}>Ngày ký kết (SignedDate)</label>
                <input type="date" {...register("signedDate")} className={getInputClass(false)} />
              </div>

              {/* Ngày bắt đầu hiệu lực (EffectiveDate) */}
              <div>
                <label className={FIELD_LABEL_CLASS}>
                  Ngày bắt đầu hiệu lực (EffectiveDate) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  {...register("effectiveDate")}
                  className={getInputClass(!!errors.effectiveDate)}
                />
                {errors.effectiveDate && (
                  <p className="text-[11px] text-rose-500 mt-1">{errors.effectiveDate.message}</p>
                )}
              </div>

              {/* Ngày kết thúc / Hết hạn (ExpiryDate) */}
              <div>
                <label className={FIELD_LABEL_CLASS}>
                  Ngày hết hạn (ExpiryDate) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  {...register("expiryDate")}
                  className={getInputClass(!!errors.expiryDate)}
                />
                {errors.expiryDate && (
                  <p className="text-[11px] text-rose-500 mt-1">{errors.expiryDate.message}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: ĐIỀU KHOẢN THANH TOÁN & GHI CHÚ ================= */}
        {activeTab === "terms" && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 flex items-center gap-3 text-xs text-indigo-900 dark:text-indigo-200">
              <span className="text-xl">💳</span>
              <div>
                <strong>Điều khoản Hợp đồng & Thanh toán:</strong> Thiết lập các mốc thanh toán và các lưu ý nghiệp vụ gắn liền với hợp đồng này.
              </div>
            </div>

            {/* Điều khoản thanh toán (PaymentTerms) */}
            <div>
              <label className={FIELD_LABEL_CLASS}>Tiến độ & Điều khoản thanh toán (PaymentTerms)</label>
              <textarea
                rows={3}
                {...register("paymentTerms")}
                placeholder="VD: Đợt 1 tạm ứng 30% khi ký HĐ, Đợt 2 thanh toán 70% sau khi hoàn thành nghiệm thu..."
                className={getInputClass(!!errors.paymentTerms)}
              />
              {errors.paymentTerms && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.paymentTerms.message}</p>
              )}
            </div>

            {/* Ghi chú (Notes) */}
            <div>
              <label className={FIELD_LABEL_CLASS}>Ghi chú nội bộ (Notes)</label>
              <textarea
                rows={3}
                {...register("notes")}
                placeholder="Ghi chú thêm thông tin quản trị hoặc liên hệ đối tác..."
                className={getInputClass(!!errors.notes)}
              />
              {errors.notes && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.notes.message}</p>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 3: UPLOAD TỆP ĐÍNH KÈM (DocumentFileUrl) ================= */}
        {activeTab === "file" && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 flex items-center gap-3 text-xs text-emerald-900 dark:text-emerald-200">
              <span className="text-xl">📁</span>
              <div>
                <strong>Lưu trữ Hồ sơ Hợp đồng (DocumentFileUrl):</strong> Tải tệp lên máy chủ backend trước qua API <code>files/upload</code>. Hệ thống sẽ tự động lấy đường dẫn URL được trả về và gắn vào trường <code>DocumentFileUrl</code> của Hợp đồng.
              </div>
            </div>

            {/* Input ẩn lưu DocumentFileUrl */}
            <input type="hidden" {...register("documentFileUrl")} />

            {/* Component FileUpload dùng chung toàn hệ thống */}
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
                  : watchDocumentFileUrl
                  ? {
                      fileName: watchDocumentFileUrl.split("/").pop() || "TaiLieuHopDong.pdf",
                      storedFileName: watchDocumentFileUrl.split("/").pop() || "TaiLieuHopDong.pdf",
                      relativeUrl: watchDocumentFileUrl,
                      fileSizeBytes: 0,
                      contentType: "",
                    }
                  : null
              }
              multiple={false}
              autoUpload={true}
              deletePhysicalOnRemove={true}
              onUploadingChange={setIsUploadingFile}
              onUploadSuccess={(result) => {
                const fileResult = Array.isArray(result) ? result[0] : result;
                if (fileResult) {
                  setUploadedFileMeta({
                    fileName: fileResult.fileName,
                    fileUrl: fileResult.relativeUrl,
                    fileSize: fileResult.fileSizeBytes,
                  });
                  setValue("documentFileUrl", fileResult.relativeUrl, {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                }
              }}
              onChange={(res) => {
                const fileResult = Array.isArray(res) ? res[0] : res;
                if (fileResult) {
                  setUploadedFileMeta({
                    fileName: fileResult.fileName,
                    fileUrl: fileResult.relativeUrl,
                    fileSize: fileResult.fileSizeBytes,
                  });
                  setValue("documentFileUrl", fileResult.relativeUrl, {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                } else {
                  setUploadedFileMeta(null);
                  setValue("documentFileUrl", "", {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                }
              }}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.zip,.rar"
              maxSizeMB={25}
              hint="Hỗ trợ định dạng PDF, DOCX, XLSX, hình ảnh Scan hoặc ZIP (Tối đa 25MB)"
            />

            {watchDocumentFileUrl && (
              <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-xs flex items-center justify-between">
                <span className="text-gray-500 font-mono text-[11px]">
                  DocumentFileUrl: <strong className="text-indigo-600 dark:text-indigo-400">{watchDocumentFileUrl}</strong>
                </span>
                <span className="text-emerald-600 font-semibold text-[11px]">✓ Sẵn sàng gửi JSON</span>
              </div>
            )}
          </div>
        )}

        {/* Modal Actions Footer */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="text-xs text-gray-400">
            {uploadedFileMeta || watchDocumentFileUrl ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                ✓ Đã đính kèm tệp tài liệu cho hợp đồng
              </span>
            ) : (
              <span>(Có thể bổ sung file tài liệu sau khi tạo)</span>
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
                  <span>{isUploadingFile ? "Đang tải file..." : "Đang lưu..."}</span>
                </>
              ) : (
                <span>{isEdit ? "Cập nhật hợp đồng" : "Lưu hợp đồng"}</span>
              )}
            </button>
          </div>
        </div>
      </form>
    )}
  </div>
</Modal>
  );
};

export default ContractModal;
