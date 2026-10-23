import { useMutation } from "@tanstack/react-query";
import { services } from "../../../di/ServiceContainer";
import { FileUploadResult, UploadOptions } from "../models/file";

export const fileKeys = {
  all: ["files"] as const,
};

export type UploadFileInput =
  | File
  | {
      file: File;
      options?: UploadOptions;
    };

export type UploadMultipleFilesInput =
  | File[]
  | {
      files: File[];
      options?: UploadOptions;
    };

/**
 * Hook Mutation tải lên 1 file đơn lẻ tới backend (/files/upload)
 */
export function useUploadFile() {
  return useMutation<FileUploadResult, Error, UploadFileInput>({
    mutationFn: (input: UploadFileInput) => {
      if (input instanceof File) {
        return services.file.uploadFile(input);
      }
      return services.file.uploadFile(input.file, input.options);
    },
  });
}

/**
 * Hook Mutation tải lên nhiều file cùng lúc tới backend (/files/upload-multiple)
 */
export function useUploadMultipleFiles() {
  return useMutation<FileUploadResult[], Error, UploadMultipleFilesInput>({
    mutationFn: (input: UploadMultipleFilesInput) => {
      if (Array.isArray(input)) {
        return services.file.uploadMultipleFiles(input);
      }
      return services.file.uploadMultipleFiles(input.files, input.options);
    },
  });
}

/**
 * Hook Mutation tải file blob về máy khách (/files/download)
 */
export function useDownloadFile() {
  return useMutation<
    Blob,
    Error,
    { fileUrl: string; fileName?: string }
  >({
    mutationFn: ({ fileUrl, fileName }) =>
      services.file.downloadFile(fileUrl, fileName),
  });
}

/**
 * Hook Mutation xóa file vật lý trên backend (/files/delete)
 */
export function useDeleteFile() {
  return useMutation<
    boolean,
    Error,
    { fileUrl: string; confirm?: boolean } | string
  >({
    mutationFn: (input) => {
      if (typeof input === "string") {
        return services.file.deleteFile(input);
      }
      return services.file.deleteFile(input.fileUrl, { confirm: input.confirm });
    },
  });
}

