import React, { useState, useEffect } from "react";
import { CloseIcon, SearchIcon } from "../../../icons";
import Button from "../button/Button";

interface SearchInputProps {
  initialValue?: string;
  onSearch: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
  initialValue = "",
  onSearch,
  placeholder = "Tìm kiếm...",
  className = "",
}) => {
  const [keyword, setKeyword] = useState(initialValue);

  // Đồng bộ lại nếu giá trị khởi tạo từ ngoài component cha thay đổi
  useEffect(() => {
    setKeyword(initialValue);
  }, [initialValue]);

  const handleSearch = () => {
    onSearch(keyword.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleClear = () => {
    setKeyword("");
    onSearch(""); // Reset kết quả tìm kiếm về rỗng
  };

  return (
    <div className={`flex w-full max-w-sm items-center gap-2 ${className}`}>
      <div className="relative flex-1">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="
            h-10 w-full rounded-lg
            border border-gray-300
            bg-white
            pl-3.5 pr-9
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

        {/* Nút xóa nhanh nội dung */}
        {keyword && (
          <button
            type="button"
            onClick={handleClear}
            className="
              absolute right-2.5 top-1/2
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

      {/* Nút Tìm kiếm */}
      <Button
        type="button"
        size="sm"
        variant="primary"
        className="!size-9 !rounded-full !p-0 !text-white flex items-center justify-center"
        onClick={handleSearch}
      >
        <SearchIcon fontSize={18} />
      </Button>
    </div>
  );
};

export default SearchInput;