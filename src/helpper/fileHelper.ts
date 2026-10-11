import { ENV } from "../config/env";
import { FileAcceptPreset, FileValidationRule } from "../models/File/file";

export type FileCategory =
  | "image"
  | "pdf"
  | "word"
  | "excel"
  | "powerpoint"
  | "archive"
  | "text"
  | "video"
  | "audio"
  | "code"
  | "other";

/**
 * Định dạng kích thước file từ byte sang đơn vị đọc thân thiện (B, KB, MB, GB)
 */
export const formatFileSize = (bytes?: number | null): string => {
  if (bytes === undefined || bytes === null || isNaN(bytes) || bytes < 0) {
    return "0 B";
  }
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const safeI = Math.min(i, sizes.length - 1);
  const formatted = parseFloat((bytes / Math.pow(k, safeI)).toFixed(1));

  return `${formatted} ${sizes[safeI]}`;
};

/**
 * Lấy phần mở rộng của tệp tin (.pdf, .docx, ...) dạng chữ thường
 */
export const getFileExtension = (filename?: string): string => {
  if (!filename) return "";
  const dotIndex = filename.lastIndexOf(".");
  if (dotIndex === -1) return "";
  return filename.substring(dotIndex).toLowerCase();
};

/**
 * Phân loại tệp tin theo họ danh mục
 */
export const getFileCategory = (filenameOrType?: string): FileCategory => {
  if (!filenameOrType) return "other";

  const clean = filenameOrType.toLowerCase();

  // Images
  if (
    clean.endsWith(".png") ||
    clean.endsWith(".jpg") ||
    clean.endsWith(".jpeg") ||
    clean.endsWith(".webp") ||
    clean.endsWith(".gif") ||
    clean.endsWith(".svg") ||
    clean.endsWith(".bmp") ||
    clean.includes("image/")
  ) {
    return "image";
  }

  // PDF
  if (clean.endsWith(".pdf") || clean.includes("application/pdf")) {
    return "pdf";
  }

  // Excel / Spreadsheet
  if (
    clean.endsWith(".xlsx") ||
    clean.endsWith(".xls") ||
    clean.endsWith(".csv") ||
    clean.includes("spreadsheet") ||
    clean.includes("excel")
  ) {
    return "excel";
  }

  // Word / Document
  if (
    clean.endsWith(".docx") ||
    clean.endsWith(".doc") ||
    clean.endsWith(".odt") ||
    clean.endsWith(".rtf") ||
    clean.includes("word") ||
    clean.includes("document")
  ) {
    return "word";
  }

  // PowerPoint
  if (
    clean.endsWith(".pptx") ||
    clean.endsWith(".ppt") ||
    clean.includes("presentation") ||
    clean.includes("powerpoint")
  ) {
    return "powerpoint";
  }

  // Archive / Nén
  if (
    clean.endsWith(".zip") ||
    clean.endsWith(".rar") ||
    clean.endsWith(".7z") ||
    clean.endsWith(".tar") ||
    clean.endsWith(".gz") ||
    clean.includes("zip") ||
    clean.includes("compressed")
  ) {
    return "archive";
  }

  // Text
  if (clean.endsWith(".txt") || clean.includes("text/plain")) {
    return "text";
  }

  // Video
  if (
    clean.endsWith(".mp4") ||
    clean.endsWith(".mov") ||
    clean.endsWith(".avi") ||
    clean.endsWith(".mkv") ||
    clean.includes("video/")
  ) {
    return "video";
  }

  // Audio
  if (
    clean.endsWith(".mp3") ||
    clean.endsWith(".wav") ||
    clean.endsWith(".ogg") ||
    clean.includes("audio/")
  ) {
    return "audio";
  }

  // Code / Config
  if (
    clean.endsWith(".json") ||
    clean.endsWith(".xml") ||
    clean.endsWith(".html") ||
    clean.endsWith(".js") ||
    clean.endsWith(".ts") ||
    clean.endsWith(".sql")
  ) {
    return "code";
  }

  return "other";
};

/**
 * Kiểm tra file có phải là hình ảnh hay không
 */
export const isImageFile = (filenameOrType?: string): boolean => {
  return getFileCategory(filenameOrType) === "image";
};

/**
 * Lấy biểu tượng emoji tương ứng cho category
 */
export const getFileCategoryEmoji = (category: FileCategory): string => {
  switch (category) {
    case "image":
      return "🖼️";
    case "pdf":
      return "📕";
    case "excel":
      return "📊";
    case "word":
      return "📘";
    case "powerpoint":
      return "📙";
    case "archive":
      return "🗜️";
    case "video":
      return "🎬";
    case "audio":
      return "🎵";
    case "text":
      return "📝";
    case "code":
      return "💻";
    default:
      return "📄";
  }
};

/**
 * Lấy màu sắc theme cho category (nền + chữ)
 */
export const getFileCategoryColorStyle = (
  category: FileCategory
): {
  bg: string;
  text: string;
  border: string;
  badge: string;
} => {
  switch (category) {
    case "pdf":
      return {
        bg: "bg-red-50 dark:bg-red-950/40",
        text: "text-red-600 dark:text-red-400",
        border: "border-red-200 dark:border-red-900/50",
        badge: "bg-red-100 dark:bg-red-900/60 text-red-700 dark:text-red-300",
      };
    case "excel":
      return {
        bg: "bg-emerald-50 dark:bg-emerald-950/40",
        text: "text-emerald-600 dark:text-emerald-400",
        border: "border-emerald-200 dark:border-emerald-900/50",
        badge: "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300",
      };
    case "word":
      return {
        bg: "bg-blue-50 dark:bg-blue-950/40",
        text: "text-blue-600 dark:text-blue-400",
        border: "border-blue-200 dark:border-blue-900/50",
        badge: "bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300",
      };
    case "powerpoint":
      return {
        bg: "bg-amber-50 dark:bg-amber-950/40",
        text: "text-amber-600 dark:text-amber-400",
        border: "border-amber-200 dark:border-amber-900/50",
        badge: "bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300",
      };
    case "image":
      return {
        bg: "bg-purple-50 dark:bg-purple-950/40",
        text: "text-purple-600 dark:text-purple-400",
        border: "border-purple-200 dark:border-purple-900/50",
        badge: "bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300",
      };
    case "archive":
      return {
        bg: "bg-orange-50 dark:bg-orange-950/40",
        text: "text-orange-600 dark:text-orange-400",
        border: "border-orange-200 dark:border-orange-900/50",
        badge: "bg-orange-100 dark:bg-orange-900/60 text-orange-700 dark:text-orange-300",
      };
    default:
      return {
        bg: "bg-gray-100 dark:bg-gray-800",
        text: "text-gray-600 dark:text-gray-300",
        border: "border-gray-200 dark:border-gray-700",
        badge: "bg-gray-150 dark:bg-gray-700 text-gray-700 dark:text-gray-300",
      };
  }
};

/**
 * Trả về URL đầy đủ từ đường dẫn tương đối (relativeUrl)
 */
export const resolveFileUrl = (relativeUrl?: string | null): string => {
  if (!relativeUrl) return "";
  if (
    relativeUrl.startsWith("http://") ||
    relativeUrl.startsWith("https://") ||
    relativeUrl.startsWith("blob:") ||
    relativeUrl.startsWith("data:")
  ) {
    return relativeUrl;
  }

  const clean = relativeUrl.startsWith("/") ? relativeUrl : `/${relativeUrl}`;
  return `${ENV.BACKEND_TARGET}${clean}`;
};

/**
 * Ánh xạ nhóm preset sang danh sách đuôi mở rộng
 */
export const getPresetExtensions = (preset?: FileAcceptPreset): string[] => {
  switch (preset) {
    case "image":
      return [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".bmp"];
    case "pdf":
      return [".pdf"];
    case "document":
      return [".pdf", ".doc", ".docx", ".odt", ".rtf", ".txt"];
    case "spreadsheet":
      return [".xlsx", ".xls", ".csv"];
    case "archive":
      return [".zip", ".rar", ".7z", ".tar", ".gz"];
    case "media":
      return [".mp4", ".mp3", ".wav", ".mov", ".avi"];
    case "all":
    default:
      return [];
  }
};

/**
 * Chuẩn hóa chuỗi accept hoặc preset thành react-dropzone accept dictionary hoặc chuỗi input accept
 */
export const resolveAcceptString = (
  accept?: string | FileAcceptPreset
): string => {
  if (!accept || accept === "all") return "";

  if (
    accept === "image" ||
    accept === "document" ||
    accept === "pdf" ||
    accept === "spreadsheet" ||
    accept === "archive" ||
    accept === "media"
  ) {
    return getPresetExtensions(accept).join(",");
  }

  return accept;
};

/**
 * Kiểm tra tính hợp lệ của file dựa trên dung lượng và định dạng
 */
export const validateFile = (
  file: File,
  rules?: FileValidationRule
): { valid: boolean; error?: string } => {
  const maxMB = rules?.maxSizeMB ?? 25;
  const maxBytes = maxMB * 1024 * 1024;

  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `Dung lượng tệp "${file.name}" (${formatFileSize(
        file.size
      )}) vượt quá giới hạn tối đa ${maxMB}MB!`,
    };
  }

  if (rules?.accept && rules.accept !== "all") {
    const allowed = resolveAcceptString(rules.accept)
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    if (allowed.length > 0) {
      const ext = getFileExtension(file.name);
      const isAllowed = allowed.some((allowedItem) => {
        if (allowedItem.startsWith(".")) {
          return ext === allowedItem;
        }
        if (allowedItem.includes("/*")) {
          const prefix = allowedItem.replace("/*", "");
          return file.type.toLowerCase().startsWith(prefix);
        }
        return file.type.toLowerCase() === allowedItem;
      });

      if (!isAllowed) {
        return {
          valid: false,
          error: `Định dạng tệp "${file.name}" không được hỗ trợ! Vui lòng chọn tệp theo đúng định dạng: ${allowed.join(
            ", "
          )}`,
        };
      }
    }
  }

  return { valid: true };
};
