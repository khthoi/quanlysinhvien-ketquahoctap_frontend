import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faChevronDown, faXmark, faCheck } from "@fortawesome/free-solid-svg-icons";

interface Option {
  value: string;
  label: string;
  secondary?: string;
}

interface MultiSelectProps {
  options: Option[];
  placeholder?: string;
  onChange: (values: string[]) => void;
  className?: string;
  defaultValue?: string[];
  disabled?: boolean;
  showSecondary?: boolean;
  secondarySeparator?: string;
  maxDisplayOptions?: number;
  searchPlaceholder?: string;
  maxDisplayTags?: number;
  selectAllLabel?: string;
  showSelectAll?: boolean;
}

const MultiSelectCustom: React.FC<MultiSelectProps> = ({
  options,
  placeholder = "Chọn các tùy chọn",
  onChange,
  className = "",
  defaultValue = [],
  disabled = false,
  showSecondary = true,
  secondarySeparator = " - ",
  maxDisplayOptions = 10,
  searchPlaceholder = "Tìm kiếm...",
  maxDisplayTags = 3,
  selectAllLabel = "Chọn tất cả",
  showSelectAll = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedValues, setSelectedValues] = useState<string[]>(defaultValue);
  const [position, setPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const [isPositioned, setIsPositioned] = useState(false);
  const [mounted, setMounted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check mounted for portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync với defaultValue
  useEffect(() => {
    setSelectedValues(defaultValue ?? []);
  }, [defaultValue]);

  // Reset state khi đóng dropdown
  useEffect(() => {
    if (!isOpen) {
      setPosition(null);
      setIsPositioned(false);
      setSearchTerm("");
    }
  }, [isOpen]);

  // Tính toán vị trí dropdown
  const calculatePosition = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const dropdownHeight = 300;
      const dropdownWidth = rect.width;

      const spaceBelow = window.innerHeight - rect.bottom;

      let top = rect.bottom + 4;
      let left = rect.left;

      if (spaceBelow < dropdownHeight && rect.top > dropdownHeight) {
        top = rect.top - dropdownHeight - 4;
      }

      if (left < 8) {
        left = 8;
      }

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
      const timer1 = requestAnimationFrame(() => {
        calculatePosition();

        const timer2 = requestAnimationFrame(() => {
          if (dropdownRef.current && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const dropdownHeight = dropdownRef.current.offsetHeight;
            const dropdownWidth = rect.width;

            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;

            let top: number;
            let left = rect.left;

            if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
              top = rect.top - dropdownHeight - 4;
            } else {
              top = rect.bottom + 4;
            }

            if (left < 8) left = 8;
            if (left + dropdownWidth > window.innerWidth - 8) {
              left = window.innerWidth - dropdownWidth - 8;
            }

            setPosition({ top, left, width: dropdownWidth });
            setIsPositioned(true);
          }
        });

        return () => cancelAnimationFrame(timer2);
      });

      return () => cancelAnimationFrame(timer1);
    }
  }, [isOpen, mounted, calculatePosition]);

  // Click outside để đóng dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      const isOutsideContainer = containerRef.current && !containerRef.current.contains(target);
      const isOutsideDropdown = !dropdownRef.current || !dropdownRef.current.contains(target);

      if (isOutsideContainer && isOutsideDropdown) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
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
        if (dropdownRef.current?.contains(e.target as Node)) {
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

  // Focus input khi mở dropdown
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
    if (!searchTerm.trim()) {
      return options;
    }
    const lowerSearch = searchTerm.toLowerCase();
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(lowerSearch) ||
        (option.secondary && option.secondary.toLowerCase().includes(lowerSearch))
    );
  }, [options, searchTerm]);

  // Giới hạn số lượng options hiển thị
  const displayedOptions = filteredOptions.slice(0, maxDisplayOptions);
  const hasMoreOptions = filteredOptions.length > maxDisplayOptions;

  // Kiểm tra đã chọn tất cả chưa
  const isAllSelected = useMemo(() => {
    return options.length > 0 && options.every((opt) => selectedValues.includes(opt.value));
  }, [options, selectedValues]);

  // Kiểm tra có một số được chọn
  const isSomeSelected = useMemo(() => {
    return selectedValues.length > 0 && !isAllSelected;
  }, [selectedValues, isAllSelected]);

  // Lấy label của các options được chọn
  const getSelectedLabels = (): Option[] => {
    return options.filter((opt) => selectedValues.includes(opt.value));
  };

  const handleSelect = (value: string) => {
    let newValues: string[];
    if (selectedValues.includes(value)) {
      newValues = selectedValues.filter((v) => v !== value);
    } else {
      newValues = [...selectedValues, value];
    }
    setSelectedValues(newValues);
    onChange(newValues);
  };

  const handleSelectAll = () => {
    let newValues: string[];
    if (isAllSelected) {
      newValues = [];
    } else {
      newValues = options.map((opt) => opt.value);
    }
    setSelectedValues(newValues);
    onChange(newValues);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedValues([]);
    onChange([]);
    setSearchTerm("");
  };

  const handleRemoveTag = (e: React.MouseEvent, value: string) => {
    e.stopPropagation();
    e.preventDefault();
    const newValues = selectedValues.filter((v) => v !== value);
    setSelectedValues(newValues);
    onChange(newValues);
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsOpen((prev) => !prev);
    }
  };

  // Render tags cho các lựa chọn đã chọn
  const renderSelectedTags = () => {
    const selectedOptions = getSelectedLabels();

    if (selectedOptions.length === 0) {
      return <span className="text-gray-400 dark:text-gray-400">{placeholder}</span>;
    }

    const displayTags = selectedOptions.slice(0, maxDisplayTags);
    const remainingCount = selectedOptions.length - maxDisplayTags;

    return (
      <div className="flex flex-wrap gap-1 items-center">
        {displayTags.map((option) => (
          <span
            key={option.value}
            className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-brand-100 text-brand-700 rounded-md dark:bg-brand-500/20 dark:text-brand-300"
          >
            <span className="truncate max-w-[100px]">{option.label}</span>
            {!disabled && (
              <span
                onClick={(e) => handleRemoveTag(e, option.value)}
                className="cursor-pointer hover:text-brand-900 dark:hover:text-brand-100"
              >
                <FontAwesomeIcon icon={faXmark} className="w-2.5 h-2.5" />
              </span>
            )}
          </span>
        ))}
        {remainingCount > 0 && (
          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-gray-200 text-gray-600 rounded-md dark:bg-gray-700 dark:text-gray-300">
            +{remainingCount}
          </span>
        )}
      </div>
    );
  };

  // Render dropdown content
  const renderDropdown = () => {
    if (!isOpen || !mounted) return null;

    return createPortal(
      <div
        ref={dropdownRef}
        style={{
          position: "fixed",
          top: position ? position.top : -9999,
          left: position ? position.left : -9999,
          width: position ? position.width : "auto",
          visibility: isPositioned ? "visible" : "hidden",
          opacity: isPositioned ? 1 : 0,
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
              className="w-full h-9 pl-9 pr-3 text-sm rounded-md border border-gray-200 bg-gray-50 text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-gray-500"
            />
          </div>
        </div>

        {/* Options List */}
        <div className="max-h-60 overflow-y-auto py-1">
          {/* Select All Option */}
          {showSelectAll && !searchTerm && (
            <div
              onClick={handleSelectAll}
              onMouseDown={(e) => e.preventDefault()}
              className={`px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 ${
                isAllSelected
                  ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              }`}
            >
              <span
                className={`w-4 h-4 rounded border flex items-center justify-center ${
                  isAllSelected
                    ? "bg-brand-500 border-brand-500"
                    : isSomeSelected
                    ? "bg-brand-200 border-brand-300 dark:bg-brand-500/30 dark:border-brand-500"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              >
                {(isAllSelected || isSomeSelected) && (
                  <FontAwesomeIcon
                    icon={isAllSelected ? faCheck : faCheck}
                    className={`w-2.5 h-2.5 ${isAllSelected ? "text-white" : "text-brand-600 dark:text-brand-400"}`}
                  />
                )}
              </span>
              <span className="font-medium">{selectAllLabel}</span>
            </div>
          )}

          {displayedOptions.length > 0 ? (
            <>
              {displayedOptions.map((option) => {
                const isSelected = selectedValues.includes(option.value);
                return (
                  <div
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    onMouseDown={(e) => e.preventDefault()}
                    className={`px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center gap-3 ${
                      isSelected
                        ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                        isSelected
                          ? "bg-brand-500 border-brand-500"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                    >
                      {isSelected && (
                        <FontAwesomeIcon icon={faCheck} className="w-2.5 h-2.5 text-white" />
                      )}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium truncate">{option.label}</span>
                      {showSecondary && option.secondary && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                          {option.secondary}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

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

        {/* Footer với số lượng đã chọn */}
        {selectedValues.length > 0 && (
          <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <span>Đã chọn: {selectedValues.length} / {options.length}</span>
            <button
              onClick={handleClear}
              onMouseDown={(e) => e.preventDefault()}
              className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
            >
              Bỏ chọn tất cả
            </button>
          </div>
        )}
      </div>,
      document.body
    );
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <div
        ref={triggerRef}
        onClick={handleToggle}
        className={`min-h-[44px] w-full appearance-none rounded-lg border border-gray-300 px-3 py-2 pr-11 text-left text-sm shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:focus:border-brand-800 ${
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
        }`}
      >
        {renderSelectedTags()}

        {/* Icons */}
        <span className="absolute inset-y-0 right-0 flex items-center gap-1 pr-3">
          {selectedValues.length > 0 && !disabled && (
            <span
              onClick={handleClear}
              onMouseDown={(e) => e.stopPropagation()}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
            >
              <FontAwesomeIcon icon={faXmark} className="w-3.5 h-3.5" />
            </span>
          )}
          <FontAwesomeIcon
            icon={faChevronDown}
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </span>
      </div>

      {/* Dropdown - Render using Portal */}
      {renderDropdown()}
    </div>
  );
};

export default MultiSelectCustom;