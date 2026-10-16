import { useState, useCallback } from "react";
import { toast } from "sonner";
import { services } from "../di/ServiceContainer";
import {
  FileUploadResult,
  UploadedFileItem,
  FileValidationRule,
} from "../models/File/file";
import { validateFile } from "../helpper/fileHelper";

export interface UseFileUploadOptions {
  multiple?: boolean;
  validation?: FileValidationRule;
  onSuccess?: (results: FileUploadResult[]) => void;
  onError?: (error: Error) => void;
}

export function useFileUpload(options?: UseFileUploadOptions) {
  const [fileList, setFileList] = useState<UploadedFileItem[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  /**
   * Tải lên 1 tập tin đơn lẻ lên /files/upload
   */
  const uploadSingle = useCallback(
    async (file: File): Promise<FileUploadResult | null> => {
      // Kiểm tra tính hợp lệ của file
      const validation = validateFile(file, options?.validation);
      if (!validation.valid) {
        toast.error(validation.error || "Tệp tin không hợp lệ!");
        return null;
      }

      const tempId = `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const tempItem: UploadedFileItem = {
        id: tempId,
        fileName: file.name,
        relativeUrl: "",
        fileSizeBytes: file.size,
        contentType: file.type,
        rawFile: file,
        status: "uploading",
        progress: 0,
        uploadedAt: new Date().toISOString(),
      };

      if (options?.multiple) {
        setFileList((prev) => [...prev, tempItem]);
      } else {
        setFileList([tempItem]);
      }

      setIsUploading(true);
      setError(null);
      setUploadProgress(0);

      try {
        const result = await services.file.uploadFile(file, {
          onProgress: (percent) => {
            setUploadProgress(percent);
            setFileList((prev) =>
              prev.map((item) =>
                item.id === tempId ? { ...item, progress: percent } : item
              )
            );
          },
        });

        const updatedItem: UploadedFileItem = {
          id: tempId,
          fileName: result.fileName,
          storedFileName: result.storedFileName,
          relativeUrl: result.relativeUrl,
          fileSizeBytes: result.fileSizeBytes || file.size,
          contentType: result.contentType || file.type,
          rawFile: file,
          status: "success",
          progress: 100,
          uploadedAt: new Date().toISOString(),
        };

        setFileList((prev) =>
          prev.map((item) => (item.id === tempId ? updatedItem : item))
        );

        toast.success(`Tải lên tệp thành công: ${file.name}`);
        options?.onSuccess?.([result]);
        return result;
      } catch (err: unknown) {
        const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
        const errMsg = errorObj?.response?.data?.message || errorObj?.message || "Lỗi tải file lên máy chủ!";
        setError(errMsg);
        setFileList((prev) =>
          prev.map((item) =>
            item.id === tempId ? { ...item, status: "error", error: errMsg } : item
          )
        );
        toast.error(`Tải lên thất bại: ${file.name}`);
        options?.onError?.(err instanceof Error ? err : new Error(errMsg));
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [options]
  );

  /**
   * Tải lên danh sách nhiều tập tin lên /files/upload-multiple
   */
  const uploadMultiple = useCallback(
    async (files: File[]): Promise<FileUploadResult[]> => {
      if (!files || files.length === 0) return [];

      // Kiểm tra giới hạn số lượng file
      if (options?.validation?.maxFiles) {
        const max = options.validation.maxFiles;
        if (fileList.length + files.length > max) {
          toast.error(`Tổng số file tải lên không được vượt quá ${max} tệp!`);
          return [];
        }
      }

      // Lọc và validate từng file
      const validFiles: File[] = [];
      for (const file of files) {
        const validation = validateFile(file, options?.validation);
        if (!validation.valid) {
          toast.error(validation.error || `File ${file.name} không hợp lệ!`);
        } else {
          validFiles.push(file);
        }
      }

      if (validFiles.length === 0) return [];

      // Nếu chỉ có 1 file hợp lệ, tự động dùng endpoint upload đơn
      if (validFiles.length === 1) {
        const singleResult = await uploadSingle(validFiles[0]);
        return singleResult ? [singleResult] : [];
      }

      const tempItems: UploadedFileItem[] = validFiles.map((file, idx) => ({
        id: `file-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
        fileName: file.name,
        relativeUrl: "",
        fileSizeBytes: file.size,
        contentType: file.type,
        rawFile: file,
        status: "uploading",
        progress: 0,
        uploadedAt: new Date().toISOString(),
      }));

      setFileList((prev) => [...prev, ...tempItems]);
      setIsUploading(true);
      setError(null);
      setUploadProgress(0);

      try {
        const results = await services.file.uploadMultipleFiles(validFiles, {
          onProgress: (percent) => {
            setUploadProgress(percent);
            setFileList((prev) =>
              prev.map((item) =>
                tempItems.some((t) => t.id === item.id)
                  ? { ...item, progress: percent }
                  : item
              )
            );
          },
        });

        // Cập nhật lại kết quả cho các item
        setFileList((prev) =>
          prev.map((item) => {
            const matchResult = results.find(
              (r) => r.fileName === item.fileName
            );
            if (matchResult && tempItems.some((t) => t.id === item.id)) {
              return {
                ...item,
                storedFileName: matchResult.storedFileName,
                relativeUrl: matchResult.relativeUrl,
                fileSizeBytes: matchResult.fileSizeBytes || item.fileSizeBytes,
                contentType: matchResult.contentType || item.contentType,
                status: "success",
                progress: 100,
              };
            }
            return item;
          })
        );

        toast.success(`Đã tải lên thành công ${results.length} tệp tin!`);
        options?.onSuccess?.(results);
        return results;
      } catch (err: unknown) {
        const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
        const errMsg = errorObj?.response?.data?.message || errorObj?.message || "Lỗi tải nhiều file lên máy chủ!";
        setError(errMsg);
        setFileList((prev) =>
          prev.map((item) =>
            tempItems.some((t) => t.id === item.id)
              ? { ...item, status: "error", error: errMsg }
              : item
          )
        );
        toast.error("Tải nhiều tệp lên thất bại!");
        options?.onError?.(err instanceof Error ? err : new Error(errMsg));
        return [];
      } finally {
        setIsUploading(false);
      }
    },
    [fileList.length, options, uploadSingle]
  );

  /**
   * Xóa một file khỏi danh sách hiển thị
   */
  const removeFile = useCallback((id: string) => {
    setFileList((prev) => prev.filter((item) => item.id !== id));
  }, []);

  /**
   * Xóa toàn bộ danh sách file
   */
  const clearFiles = useCallback(() => {
    setFileList([]);
    setError(null);
    setUploadProgress(0);
  }, []);

  return {
    fileList,
    setFileList,
    isUploading,
    uploadProgress,
    error,
    uploadSingle,
    uploadMultiple,
    removeFile,
    clearFiles,
  };
}
