import React, { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

export interface Option {
  key?: number | string;
  value?: number | string;
  label?: string;
  title?: string;
  [key: string]: any;
}

export type SelectOption = Option;

export interface SelectProps {
  options: Option[];
  placeholder?: string;
  onChange?: (value: string, selectedOption?: Option) => void;
  className?: string;
  defaultValue?: string | number;
  value?: string | number; // Nhận value hoặc id từ Controller / Form State
  size?: "sm" | "md";
}

/**
 * Phân giải option linh hoạt:
 * - Chuẩn SelectListItem backend: { key: 1, value: "Tên hiển thị" } -> key: "1", label: "Tên hiển thị"
 * - Chuẩn UI truyền thống: { value: "1", label: "Tên hiển thị" } -> key: "1", label: "Tên hiển thị"
 */
export const resolveOption = (
  opt: Option
): {
  key: string;
  label: string;
  rawKey: number | string;
  rawValue: string;
} => {
  // TH 1: Có `label` rõ ràng ({ value, label } hoặc { key, label })
  if (opt.label !== undefined && opt.label !== null) {
    const rawK =
      opt.key !== undefined && opt.key !== null ? opt.key : (opt.value ?? "");
    return {
      key: String(rawK),
      label: String(opt.label),
      rawKey: rawK,
      rawValue: String(opt.label),
    };
  }

  // TH 2: Chuẩn { key, value } (key là ID, value là Tên hiển thị)
  if (opt.key !== undefined && opt.key !== null) {
    const rawVal = opt.value !== undefined && opt.value !== null ? opt.value : opt.key;
    return {
      key: String(opt.key),
      label: String(rawVal),
      rawKey: opt.key,
      rawValue: String(rawVal),
    };
  }

  // TH 3: Chỉ có `value` ({ value: "xxx" })
  const raw = opt.value ?? "";
  return {
    key: String(raw),
    label: String(raw),
    rawKey: raw,
    rawValue: String(raw),
  };
};

const Select: React.FC<SelectProps> = ({
  options = [],
  placeholder = "Select an option",
  onChange,
  className = "",
  defaultValue = "",
  value,
  size = "md",
}) => {
  const [selectedValue, setSelectedValue] = useState<string>(
    String(value ?? defaultValue ?? "")
  );

  // Đồng bộ hai chiều: nếu value truyền vào là ID (key) hoặc Tên (label/value)
  useEffect(() => {
    if (value !== undefined && value !== null && value !== "") {
      const strVal = String(value);
      // Tìm theo key trước (ID)
      const matchByKey = options.find((opt) => resolveOption(opt).key === strVal);
      if (matchByKey) {
        setSelectedValue(resolveOption(matchByKey).key);
      } else {
        // Fallback tìm theo text (Tên hiển thị)
        const matchByLabel = options.find(
          (opt) => resolveOption(opt).label.toLowerCase() === strVal.toLowerCase()
        );
        if (matchByLabel) {
          setSelectedValue(resolveOption(matchByLabel).key);
        } else {
          setSelectedValue(strVal);
        }
      }
    } else {
      setSelectedValue("");
    }
  }, [value, options]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedValue(val);

    const matched = options.find((opt) => resolveOption(opt).key === val);
    if (matched) {
      const resolved = resolveOption(matched);
      const normalizedOption: Option = {
        ...matched,
        key: resolved.rawKey,
        value: resolved.rawValue,
      };
      onChange?.(val, normalizedOption);
    } else {
      onChange?.(val, undefined);
    }
  };

  const isSmall = size === "sm";
  const baseClasses = isSmall
    ? "h-9 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-3 py-1.5 pr-8 text-xs shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:placeholder:text-white/30 dark:focus:border-brand-800 cursor-pointer"
    : "h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:placeholder:text-white/30 dark:focus:border-brand-800 cursor-pointer";

  return (
    <div className="relative w-full">
      <select
        className={twMerge(
          clsx(
            baseClasses,
            selectedValue
              ? "text-gray-800 dark:text-white/90"
              : "text-gray-400 dark:text-gray-400",
            className
          )
        )}
        value={selectedValue}
        onChange={handleChange}
      >
        <option
          value=""
          disabled
          className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
        >
          {placeholder}
        </option>
        {options.map((option, idx) => {
          const resolved = resolveOption(option);
          return (
            <option
              key={`${resolved.key}-${idx}`}
              value={resolved.key}
              title={option.title || resolved.label}
              className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
            >
              {resolved.label}
            </option>
          );
        })}
      </select>

      {/* Dropdown Chevron Indicator */}
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
        <svg
          className={isSmall ? "w-3.5 h-3.5" : "w-4 h-4"}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </span>
    </div>
  );
};

export default Select;