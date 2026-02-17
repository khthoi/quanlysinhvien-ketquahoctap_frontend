import type React from "react";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faMinus } from "@fortawesome/free-solid-svg-icons";

interface CheckboxProps {
  label?: React.ReactNode;
  checked: boolean;
  className?: string;
  id?: string;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  indeterminate?: boolean; // Thêm trạng thái indeterminate cho "check một phần"
}

const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  id,
  onChange,
  className = "",
  disabled = false,
  indeterminate = false,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (checked || indeterminate) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 200);
      return () => clearTimeout(timer);
    }
  }, [checked, indeterminate]);

  return (
    <label
      className={`flex items-center space-x-3 group cursor-pointer select-none ${
        disabled ? "cursor-not-allowed opacity-60" : ""
      }`}
    >
      <div className="relative w-5 h-5">
        <input
          id={id}
          type="checkbox"
          className={`
            w-5 h-5 appearance-none cursor-pointer 
            border-2 rounded-md
            transition-all duration-200 ease-out
            ${checked || indeterminate
              ? "border-brand-500 bg-brand-500 dark:border-brand-400 dark:bg-brand-500"
              : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
            }
            ${! disabled && ! checked && !indeterminate
              ?  "hover:border-brand-400 dark:hover:border-brand-500 hover:shadow-sm"
              : ""
            }
            ${isAnimating ? "scale-95" : "scale-100"}
            disabled:opacity-60 disabled:cursor-not-allowed
            focus:outline-none focus:ring-0 focus:ring-offset-0
            ${className}
          `}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
        {/* Icon Check */}
        <div
          className={`
            absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
            pointer-events-none transition-all duration-200 ease-out
            ${checked && !indeterminate
              ? "opacity-100 scale-100"
              : "opacity-0 scale-50"
            }
          `}
        >
          <FontAwesomeIcon
            icon={faCheck}
            className={`text-xs ${disabled ? "text-gray-300" : "text-white"}`}
          />
        </div>
        {/* Icon Indeterminate (dấu trừ) */}
        <div
          className={`
            absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
            pointer-events-none transition-all duration-200 ease-out
            ${indeterminate && !checked
              ? "opacity-100 scale-100"
              : "opacity-0 scale-50"
            }
          `}
        >
          <FontAwesomeIcon
            icon={faMinus}
            className={`text-xs ${disabled ? "text-gray-300" : "text-white"}`}
          />
        </div>
      </div>
      {label && (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors">
          {label}
        </span>
      )}
    </label>
  );
};

export default Checkbox;