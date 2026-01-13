import React, { useState, useRef, useEffect, useMemo, useLayoutEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faChevronDown, faXmark } from "@fortawesome/free-solid-svg-icons";

interface Option {
  value: string;
  label: string;
  secondary?: string;
}

interface SearchableSelectProps {
  options:  Option[];
  placeholder?: string;
  onChange: (value: string) => void;
  className?:  string;
  defaultValue?: string;
  disabled?: boolean;
  showSecondary?: boolean;
  secondarySeparator?:  string;
  maxDisplayOptions?:  number;
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
  const [position, setPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const [isPositioned, setIsPositioned] = useState(false);
  const [mounted, setMounted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check mounted for portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync với defaultValue
  useEffect(() => {
    setSelectedValue(defaultValue ??  "");
  }, [defaultValue]);

  // Reset state khi đóng dropdown
  useEffect(() => {
    if (! isOpen) {
      setPosition(null);
      setIsPositioned(false);
      setSearchTerm("");
    }
  }, [isOpen]);

  // Tính toán vị trí dropdown
  const calculatePosition = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const dropdownHeight = 300; // Approximate max height
      const dropdownWidth = rect.width;

      // Kiểm tra không gian phía dưới
      const spaceBelow = window.innerHeight - rect.bottom;

      let top = rect.bottom + 4;
      let left = rect.left;

      // Nếu không đủ chỗ bên dưới, hiển thị phía trên
      if (spaceBelow < dropdownHeight && rect.top > dropdownHeight) {
        top = rect.top - dropdownHeight - 4;
      }

      // Đảm bảo không tràn ra ngoài bên trái
      if (left < 8) {
        left = 8;
      }

      // Đảm bảo không tràn ra ngoài bên phải
      if (left + dropdownWidth > window.innerWidth - 8) {
        left = window.innerWidth - dropdownWidth - 8;
      }

      setPosition({ top, left, width: dropdownWidth });
      setIsPositioned(true);
    }
  }, []);

  // Tính toán vị trí khi mở dropdown
  useEffect(() => {
    if (isOpen && mounted) {
      // Delay nhỏ để đảm bảo DOM đã render
      const timer = requestAnimationFrame(() => {
        calculatePosition();
      });
      return () => cancelAnimationFrame(timer);
    }
  }, [isOpen, mounted, calculatePosition]);

  // Click outside để đóng dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      const isOutsideContainer = containerRef.current && !containerRef. current.contains(target);
      const isOutsideDropdown = ! dropdownRef.current || !dropdownRef.current.contains(target);

      if (isOutsideContainer && isOutsideDropdown) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      // Delay để tránh đóng ngay khi vừa mở
      const timer = setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 0);

      return () => {
        clearTimeout(timer);
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  // Đóng dropdown khi scroll
  useEffect(() => {
    if (isOpen) {
      const handleScroll = (e: Event) => {
        // Không đóng nếu scroll trong dropdown
        if (dropdownRef. current?. contains(e.target as Node)) {
          return;
        }
        setIsOpen(false);
      };

      window.addEventListener("scroll", handleScroll, true);
      return () => {
        window.removeEventListener("scroll", handleScroll, true);
      };
    }
  }, [isOpen]);

  // Focus input khi mở dropdown và đã positioned
  useEffect(() => {
    if (isOpen && isPositioned && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isPositioned]);

  // Lọc options theo search term
  const filteredOptions = useMemo(() => {
    if (!searchTerm. trim()) {
      return options;
    }
    const lowerSearch = searchTerm.toLowerCase();
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(lowerSearch) ||
        (option.secondary && option.secondary. toLowerCase().includes(lowerSearch))
    );
  }, [options, searchTerm]);

  // Giới hạn số lượng options hiển thị
  const displayedOptions = filteredOptions.slice(0, maxDisplayOptions);
  const hasMoreOptions = filteredOptions.length > maxDisplayOptions;

  // Format label hiển thị
  const formatOptionLabel = (option: Option): string => {
    if (! showSecondary || ! option.secondary) {
      return option.label;
    }
    return `${option.label}${secondarySeparator}${option. secondary}`;
  };

  // Lấy label của option được chọn
  const getSelectedLabel = (): string => {
    if (! selectedValue) return placeholder;
    const selected = options.find((opt) => opt.value === selectedValue);
    return selected ?  formatOptionLabel(selected) : placeholder;
  };

  const handleSelect = (value: string) => {
    setSelectedValue(value);
    onChange(value);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedValue("");
    onChange("");
    setSearchTerm("");
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (! disabled) {
      setIsOpen((prev) => !prev);
    }
  };

  // Render dropdown content
  const renderDropdown = () => {
    if (!isOpen || !mounted) return null;

    return createPortal(
      <div
        ref={dropdownRef}
        style={{
          position: "fixed",
          top: position ?  position.top : -9999,
          left: position ? position.left : -9999,
          width: position ? position.width : "auto",
          visibility: isPositioned ? "visible" : "hidden",
          opacity:  isPositioned ? 1 :  0,
        }}
        className="z-[99999] rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900 transition-opacity duration-75"
      >
        {/* Search Input */}
        <div className="p-2 border-b border-gray-100 dark:border-gray-700">
          <div className="relative">
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            />
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onMouseDown={(e) => e.stopPropagation()}
              placeholder={searchPlaceholder}
              className="w-full h-9 pl-9 pr-3 text-sm rounded-md border border-gray-200 bg-gray-50 text-gray-800 placeholder: text-gray-400 focus: border-brand-300 focus:outline-none focus:ring-2 focus: ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-gray-500"
            />
          </div>
        </div>

        {/* Options List */}
        <div className="max-h-60 overflow-y-auto py-1">
          {/* Option "Tất cả" / Placeholder */}
          <div
            onClick={() => handleSelect("")}
            onMouseDown={(e) => e.preventDefault()}
            className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
              selectedValue === ""
                ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            }`}
          >
            {placeholder}
          </div>

          {displayedOptions.length > 0 ? (
            <>
              {displayedOptions.map((option) => (
                <div
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  onMouseDown={(e) => e.preventDefault()}
                  className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                    selectedValue === option.value
                      ? "bg-brand-50 text-brand-600 dark: bg-brand-500/10 dark:text-brand-400"
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
      </div>,
      document.body
    );
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
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
              onMouseDown={(e) => e.stopPropagation()}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
            >
              <FontAwesomeIcon icon={faXmark} className="w-3. 5 h-3.5" />
            </span>
          )}
          <FontAwesomeIcon
            icon={faChevronDown}
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </span>
      </button>

      {/* Dropdown - Render using Portal */}
      {renderDropdown()}
    </div>
  );
};

export default SearchableSelect;