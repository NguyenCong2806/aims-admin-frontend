import React from "react";
import { CloseIcon, SearchIcon } from "../../../icons";


interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = "Tìm kiếm...",
  className = "",
}) => {
  return (
    <div className={`relative w-full max-w-sm ${className}`}>
      {/* Search icon */}
      <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        <SearchIcon fontSize={18} />
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          h-10 w-full rounded-lg
          border border-gray-300
          bg-white
          pl-10 pr-10
          text-sm text-gray-700
          outline-none
          transition
          placeholder:text-gray-400
          focus:border-brand-500
          focus:ring-2 focus:ring-brand-500/10
          dark:border-gray-700
          dark:bg-gray-800
          dark:text-white
          dark:placeholder:text-gray-500
        "
      />

      {/* Clear */}
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="
            absolute right-3 top-1/2
            flex size-5
            -translate-y-1/2
            items-center justify-center
            rounded-full
            text-gray-400
            hover:bg-gray-100
            hover:text-gray-600
            dark:hover:bg-gray-700
          "
        >
          <CloseIcon className="size-4" />
        </button>
      )}
    </div>
  );
};

export default SearchInput;