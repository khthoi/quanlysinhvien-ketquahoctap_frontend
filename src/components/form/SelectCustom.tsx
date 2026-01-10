import React, { useState, useRef, useEffect, useMemo } from "react";

interface Option {
  value:  string;
  label: string;
  secondary?: string;
}

interface SearchableSelectProps {
  options: Option[];
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
  defaultValue?: string;
  disabled?: boolean;
  showSecondary?: boolean;
  secondarySeparator?: string;
  maxDisplayOptions?: number; // Số lượng options hiển thị tối đa
  searchPlaceholder?: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  placeholder = "Chọn một tùy chọn",
  onChange,
  className = "",
  defaultValue = "",
  disabled = false,
  showSecondary = true,
  secondarySeparator = " - ",
  maxDisplayOptions = 10,
  searchPlaceholder = "Tìm kiếm...",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedValue, setSelectedValue] = useState<string>(defaultValue);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync với defaultValue
  useEffect(() => {
    setSelectedValue(defaultValue ??  "");
  }, [defaultValue]);

  // Click outside để đóng dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef. current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus input khi mở dropdown
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Lọc options theo search term
  const filteredOptions = useMemo(() => {
    if (!searchTerm. trim()) {
      return options;
    }
    const lowerSearch = searchTerm. toLowerCase();
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(lowerSearch) ||
        (option.secondary && option.secondary.toLowerCase().includes(lowerSearch))
    );
  }, [options, searchTerm]);

  // Giới hạn số lượng options hiển thị
  const displayedOptions = filteredOptions.slice(0, maxDisplayOptions);
  const hasMoreOptions = filteredOptions.length > maxDisplayOptions;

  // Format label hiển thị
  const formatOptionLabel = (option:  Option): string => {
    if (! showSecondary || !option.secondary) {
      return option.label;
    }
    return `${option.label}${secondarySeparator}${option.secondary}`;
  };

  // Lấy label của option được chọn
  const getSelectedLabel = (): string => {
    if (! selectedValue) return placeholder;
    const selected = options.find((opt) => opt.value === selectedValue);
    return selected ? formatOptionLabel(selected) : placeholder;
  };

  const handleSelect = (value: string) => {
    setSelectedValue(value);
    onChange(value);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedValue("");
    onChange("");
    setSearchTerm("");
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(! isOpen)}
        disabled={disabled}
        className={`h-11 w-full appearance-none rounded-lg border border-gray-300 px-4 py-2.5 pr-11 text-left text-sm shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:focus:border-brand-800 ${
          selectedValue
            ? "text-gray-800 dark:text-white/90"
            : "text-gray-400 dark:text-gray-400"
        } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
      >
        <span className="block truncate">{getSelectedLabel()}</span>
        
        {/* Icons */}
        <span className="absolute inset-y-0 right-0 flex items-center gap-1 pr-3">
          {selectedValue && ! disabled && (
            <span
              onClick={handleClear}
              className="p-1 text-gray-400 hover: text-gray-600 dark:hover:text-gray-300 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </span>
          )}
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-100 dark:border-gray-700">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full h-9 pl-9 pr-3 text-sm rounded-md border border-gray-200 bg-gray-50 text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-gray-500"
              />
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto py-1">
            {/* Option "Tất cả" */}
            <div
              onClick={() => handleSelect("")}
              className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                selectedValue === ""
                  ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                  :  "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              }`}
            >
              {placeholder}
            </div>

            {displayedOptions.length > 0 ?  (
              <>
                {displayedOptions.map((option) => (
                  <div
                    key={option. value}
                    onClick={() => handleSelect(option.value)}
                    className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                      selectedValue === option.value
                        ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{option.label}</span>
                      {showSecondary && option.secondary && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {option.secondary}
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {/* Hiển thị "..." khi còn nhiều options */}
                {hasMoreOptions && (
                  <div className="px-4 py-2 text-sm text-gray-400 dark:text-gray-500 text-center border-t border-gray-100 dark:border-gray-700">
                    <span className="flex items-center justify-center gap-1">
                      <span>...</span>
                      <span className="text-xs">
                        (còn {filteredOptions.length - maxDisplayOptions} kết quả khác)
                      </span>
                    </span>
                  </div>
                )}
              </>
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                Không tìm thấy kết quả
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;