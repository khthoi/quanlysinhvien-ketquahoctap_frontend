import React, { useEffect, useState } from "react";

interface Option {
  value: string;
  label: string;
  secondary?: string; // Text phụ (tùy chọn)
}

interface SelectProps {
  options: Option[];
  placeholder?: string;
  placeholderValue?: string;
  placeholderDisabled?: boolean;
  placeholderClassName?: string;
  onChange: (value: string) => void;
  className?: string;
  defaultValue?: string;
  disabled?: boolean;
  showSecondary?: boolean; // Tùy chọn hiển thị secondary text
  secondarySeparator?: string; // Ký tự phân cách (mặc định: " - ")
}

const Select: React.FC<SelectProps> = ({
  options,
  placeholder = "Select an option",
  placeholderValue = "",
  placeholderDisabled = true,
  placeholderClassName = "",
  onChange,
  className = "",
  defaultValue = "",
  disabled = false,
  showSecondary = true, // Mặc định hiển thị secondary text
  secondarySeparator = " - ", // Ký tự phân cách mặc định
}) => {
  // Manage the selected value
  const [selectedValue, setSelectedValue] = useState<string>(defaultValue);

  // Keep internal state in sync when defaultValue prop changes
  useEffect(() => {
    setSelectedValue(defaultValue ?? "");
  }, [defaultValue]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedValue(value);
    onChange(value); // Trigger parent handler
  };

  // Format option label with secondary text
  const formatOptionLabel = (option: Option): string => {
    if (!showSecondary || !option.secondary) {
      return option.label;
    }
    return `${option.label}${secondarySeparator}${option.secondary}`;
  };

  return (
    <select
      className={`h-11 w-full appearance-none rounded-lg border border-gray-300 px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 ${
        selectedValue
          ? "text-gray-800 dark:text-white/90"
          : "text-gray-400 dark:text-gray-400"
      } ${className}`}
      value={selectedValue}
      onChange={handleChange}
      disabled={disabled}
    >
      {/* Placeholder option (configurable) */}
      {placeholder !== undefined && (
        <option
          value={placeholderValue}
          disabled={placeholderDisabled}
          className={`text-gray-700 dark:bg-gray-900 dark:text-gray-400 ${placeholderClassName}`}
        >
          {placeholder}
        </option>
      )}
      {/* Map over options */}
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
          className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
        >
          {formatOptionLabel(option)}
        </option>
      ))}
    </select>
  );
};

export default Select;