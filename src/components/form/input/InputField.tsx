import React, { forwardRef } from "react";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  size?: "sm" | "md";
  inputSize?: "sm" | "md";
  success?: boolean;
  error?: boolean;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      type = "text",
      className = "",
      disabled = false,
      success = false,
      error = false,
      hint,
      size = "md",
      inputSize,
      ...rest // 👈 Nhận toàn bộ register props: name, onChange, onBlur, ref
    },
    ref
  ) => {
    const effectiveSize = inputSize || size;
    const isSmall = effectiveSize === "sm";

    const baseClasses = isSmall
      ? "h-9 w-full rounded-lg border appearance-none px-3 py-1.5 text-xs shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
      : "h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30";

    let stateClasses = "bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90 dark:focus:border-brand-800";
    if (disabled) {
      stateClasses = "text-gray-500 border-gray-300 opacity-40 bg-gray-100 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700";
    } else if (error) {
      stateClasses = "border-error-500 focus:border-error-300 focus:ring-error-500/20 dark:text-error-400 dark:border-error-500 dark:focus:border-error-800";
    } else if (success) {
      stateClasses = "border-success-500 focus:border-success-300 focus:ring-success-500/20 dark:text-success-400 dark:border-success-500 dark:focus:border-success-800";
    }

    return (
      <div className="relative">
        <input
          ref={ref}
          type={type}
          disabled={disabled}
          className={twMerge(clsx(baseClasses, stateClasses, className))}
          {...rest} // 👈 Truyền trực tiếp vào đây
        />

        {hint && (
          <p
            className={`mt-1 text-xs ${
              error
                ? "text-error-500"
                : success
                ? "text-success-500"
                : "text-gray-500"
            }`}
          >
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;