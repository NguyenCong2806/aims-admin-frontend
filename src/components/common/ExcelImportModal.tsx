import React, { useState, useCallback, useRef } from "react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { Modal } from "../ui/modal";
import { FileIcon, TrashBinIcon, DownloadIcon, CheckCircleIcon } from "../../icons";

export interface ExcelImportColumn {
  key: string;
  label: string;
  required?: boolean;
  sample?: string | number;
  description?: string;
}

export interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  templateFileName?: string;
  templateUrl?: string;
  templateCsvContent?: string;
  columns?: ExcelImportColumn[];
  onImport: (data: any[], file?: File) => Promise<void> | void;
  isLoading?: boolean;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  title = "Nhập dữ liệu từ tệp Excel",
  subtitle = "Hỗ trợ định dạng .xlsx, .xls hoặc .csv",
  templateFileName = "Mau_Nhap_Du_Lieu.xlsx",
  templateUrl,
  templateCsvContent,
  columns = [],
  onImport,
  isLoading: isExternalLoading = false,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [previewTab, setPreviewTab] = useState<"upload" | "preview">("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset khi đóng mở modal
  const handleReset = useCallback(() => {
    setSelectedFile(null);
    setParsedRows([]);
    setHeaders([]);
    setIsParsing(false);
    setIsImporting(false);
    setPreviewTab("upload");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleClose = () => {
    handleReset();
    onClose();
  };

  // Helper tải file mẫu CSV chuẩn UTF-8 BOM
  const handleDownloadCsvTemplate = () => {
    try {
      const baseName = templateFileName.replace(/\.(xlsx|xls|csv)$/i, "");
      const fileName = `${baseName}.csv`;

      if (templateCsvContent) {
        // Thêm UTF-8 BOM \uFEFF để Excel hiển thị đúng tiếng Việt có dấu
        const blob = new Blob(["\uFEFF" + templateCsvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success(`Đang tải file mẫu CSV: ${fileName}`);
        return;
      }

      // Tải tệp tĩnh từ /templates/ hoặc templateUrl
      const finalUrl = templateUrl || `/templates/${fileName}`;
      const link = document.createElement("a");
      link.href = finalUrl;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Đang tải file mẫu CSV: ${fileName}`);
    } catch (err) {
      console.error("Lỗi tải file mẫu CSV:", err);
      toast.error("Không thể tải file mẫu CSV.");
    }
  };

  // Helper tải về file mẫu Excel (.xlsx)
  const handleDownloadExcelTemplate = () => {
    try {
      const baseName = templateFileName.replace(/\.(xlsx|xls|csv)$/i, "");
      const fileName = `${baseName}.xlsx`;

      // Nếu có templateCsvContent, xuất trực tiếp workbook Excel từ nội dung CSV
      if (templateCsvContent) {
        const wb = XLSX.read(templateCsvContent, { type: "string" });
        XLSX.writeFile(wb, fileName);
        toast.success(`Đang tải file mẫu Excel: ${fileName}`);
        return;
      }

      const finalUrl = templateUrl || `/templates/${fileName}`;
      const link = document.createElement("a");
      link.href = finalUrl;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Đang tải file mẫu Excel: ${fileName}`);
    } catch (err) {
      console.error("Lỗi tải file mẫu Excel:", err);
      toast.error("Không thể tải file mẫu Excel. Vui lòng kiểm tra lại đường dẫn.");
    }
  };

  // 2. Đọc file Excel / CSV
  const processFile = useCallback(
    async (file: File) => {
      setSelectedFile(file);
      setIsParsing(true);

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const buffer = e.target?.result;
          if (!buffer) throw new Error("Không thể đọc tệp.");

          const wb = XLSX.read(buffer, { type: "array" });
          const firstSheetName = wb.SheetNames[0];
          if (!firstSheetName) {
            toast.error("Tệp Excel không chứa trang tính (sheet) nào!");
            setIsParsing(false);
            return;
          }

          const ws = wb.Sheets[firstSheetName];
          // Đọc dữ liệu thành mảng JSON
          const rawData = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: "" });

          if (!rawData || rawData.length === 0) {
            toast.warning("Tệp Excel không có dòng dữ liệu nào!");
            setIsParsing(false);
            return;
          }

          const detectedHeaders = Object.keys(rawData[0] || {});
          setHeaders(detectedHeaders);

          // Nếu có định nghĩa columns, ánh xạ nhãn tiếng Việt sang key đối tượng
          let mappedRows = rawData;
          if (columns && columns.length > 0) {
            const labelToKeyMap = new Map<string, string>();
            columns.forEach((c) => {
              labelToKeyMap.set(c.label.trim().toLowerCase(), c.key);
              labelToKeyMap.set(c.key.trim().toLowerCase(), c.key);
            });

            mappedRows = rawData.map((row) => {
              const mappedItem: Record<string, any> = {};
              Object.entries(row).forEach(([colHeader, cellVal]) => {
                const normalized = colHeader.trim().toLowerCase();
                const matchedKey = labelToKeyMap.get(normalized) || colHeader;
                mappedItem[colHeader] = cellVal;
                mappedItem[matchedKey] = cellVal;
              });
              return mappedItem;
            });
          }

          setParsedRows(mappedRows);
          setPreviewTab("preview");
          toast.success(`Đã đọc thành công ${mappedRows.length} dòng dữ liệu từ tệp!`);
        } catch (err) {
          console.error("Lỗi xử lý file Excel:", err);
          toast.error("Không thể đọc tệp Excel. Vui lòng kiểm tra lại định dạng tệp.");
        } finally {
          setIsParsing(false);
        }
      };

      reader.onerror = () => {
        toast.error("Lỗi khi đọc tệp.");
        setIsParsing(false);
      };

      reader.readAsArrayBuffer(file);
    },
    [columns]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // 3. Thực hiện nhập dữ liệu
  const handleConfirmImport = async () => {
    if (parsedRows.length === 0) {
      toast.error("Không có dữ liệu hợp lệ để nhập.");
      return;
    }

    setIsImporting(true);
    try {
      await onImport(parsedRows, selectedFile || undefined);
      toast.success(`Đã hoàn tất nhập ${parsedRows.length} dòng dữ liệu vào hệ thống!`);
      handleClose();
    } catch (err) {
      console.error("Lỗi nhập dữ liệu:", err);
      toast.error(`Nhập dữ liệu thất bại: ${err instanceof Error ? err.message : "Đã có lỗi xảy ra."}`);
    } finally {
      setIsImporting(false);
    }
  };

  const isBusy = isParsing || isImporting || isExternalLoading;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      className="max-w-3xl"
    >
      <div className="space-y-4">
        {/* Banner hướng dẫn & Tải file mẫu */}
        <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-indigo-950 dark:text-indigo-200">
              Quy trình nhập dữ liệu 2 bước tiện lợi:
            </h4>
            <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-0.5">
              Tải file mẫu (CSV hoặc Excel) → Điền thông tin → Tải lên để hệ thống tự động kiểm tra và nhập.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleDownloadCsvTemplate}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-200 bg-white dark:bg-emerald-950/60 hover:bg-emerald-50 dark:hover:bg-emerald-900/60 rounded-xl border border-emerald-300 dark:border-emerald-800 shadow-2xs transition-all cursor-pointer"
              title="Tải file mẫu định dạng .csv chuẩn UTF-8"
            >
              <DownloadIcon className="w-4 h-4 text-emerald-600" />
              <span>Tải file CSV mẫu</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadExcelTemplate}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-700 dark:text-indigo-200 bg-white dark:bg-indigo-900/60 hover:bg-indigo-100 dark:hover:bg-indigo-800 rounded-xl border border-indigo-200 dark:border-indigo-700 shadow-2xs transition-all cursor-pointer"
              title="Tải file mẫu định dạng bảng tính .xlsx"
            >
              <DownloadIcon className="w-4 h-4 text-indigo-600" />
              <span>Tải file Excel mẫu</span>
            </button>
          </div>
        </div>

        {/* Tab chuyển đổi: Chọn file / Xem trước */}
        <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-2">
          <button
            type="button"
            onClick={() => setPreviewTab("upload")}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              previewTab === "upload"
                ? "bg-indigo-600 text-white shadow-2xs"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            1. Chọn tệp tải lên
          </button>
          <button
            type="button"
            disabled={parsedRows.length === 0}
            onClick={() => setPreviewTab("preview")}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              previewTab === "preview"
                ? "bg-indigo-600 text-white shadow-2xs"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
            }`}
          >
            2. Xem trước & Xác nhận ({parsedRows.length} dòng)
          </button>
        </div>

        {/* TAB 1: UPLOAD DROPZONE */}
        {previewTab === "upload" && (
          <div className="space-y-3">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="relative border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-emerald-500 dark:hover:border-emerald-400 rounded-3xl p-8 text-center transition-all bg-gray-50/60 dark:bg-gray-850/40 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 group cursor-pointer"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                disabled={isBusy}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-md shadow-emerald-500/10">
                  {isParsing ? (
                    <div className="w-6 h-6 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FileIcon className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">
                    {isParsing
                      ? "Đang đọc và phân tích cấu trúc tệp..."
                      : selectedFile
                      ? `Đã chọn: ${selectedFile.name}`
                      : "Kéo & thả file Excel (.xlsx, .xls) hoặc .csv vào đây"}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {subtitle}
                  </p>
                </div>

                <button
                  type="button"
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-gray-800 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-2xs hover:bg-emerald-600 hover:text-white transition-all cursor-pointer"
                >
                  Chọn file từ máy tính
                </button>
              </div>
            </div>

            {/* Chi tiết file đã chọn */}
            {selectedFile && (
              <div className="p-3.5 rounded-xl bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                    XLS
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-xs sm:max-w-md">
                      {selectedFile.name}
                    </h5>
                    <p className="text-[11px] text-gray-400">
                      {(selectedFile.size / 1024).toFixed(1)} KB • {parsedRows.length} dòng dữ liệu tìm thấy
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewTab("preview")}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 transition-colors cursor-pointer"
                  >
                    Xem dữ liệu →
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="p-1.5 text-xs rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    title="Gỡ tệp"
                  >
                    <TrashBinIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PREVIEW BẢNG DỮ LIỆU */}
        {previewTab === "preview" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1.5">
                <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                Đã nhận diện <strong>{parsedRows.length} dòng</strong> từ tệp{" "}
                <span className="font-mono text-gray-700 dark:text-gray-300">
                  {selectedFile?.name}
                </span>
              </span>
              <span>Hiển thị tối đa 50 dòng đầu tiên</span>
            </div>

            {/* Bảng xem trước dữ liệu */}
            <div className="max-h-72 overflow-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xs">
              <table className="w-full text-left text-xs text-gray-700 dark:text-gray-300 border-collapse">
                <thead className="bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 sticky top-0 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-3 py-2.5 font-bold w-12 text-center">#</th>
                    {headers.map((h, i) => (
                      <th key={i} className="px-3 py-2.5 font-bold whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {parsedRows.slice(0, 50).map((row, rIdx) => (
                    <tr
                      key={rIdx}
                      className="hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 transition-colors"
                    >
                      <td className="px-3 py-2 text-center text-gray-400 font-mono text-[11px]">
                        {rIdx + 1}
                      </td>
                      {headers.map((h, cIdx) => (
                        <td
                          key={cIdx}
                          className="px-3 py-2 whitespace-nowrap max-w-xs truncate"
                        >
                          {String(row[h] !== undefined && row[h] !== null ? row[h] : "")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal Footer Actions */}
        <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="text-xs text-gray-400">
            {parsedRows.length > 0 && (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                ✓ Sẵn sàng nhập {parsedRows.length} bản ghi
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleClose}
              disabled={isBusy}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>

            <button
              type="button"
              onClick={handleConfirmImport}
              disabled={isBusy || parsedRows.length === 0}
              className="px-5 py-2 text-xs font-semibold rounded-xl text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {isImporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang nhập dữ liệu...</span>
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-4 h-4" />
                  <span>Xác nhận nhập ({parsedRows.length})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ExcelImportModal;
