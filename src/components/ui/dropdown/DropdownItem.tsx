import type React from "react";
import Link from "next/link";

interface DropdownItemProps {
  tag?: "a" | "button";
  href?: string;
  onClick?: () => void;
  onItemClick?: () => void;
  baseClassName?: string;
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
}

export const DropdownItem: React.FC<DropdownItemProps> = ({
  tag = "button",
  href,
  onClick,
  onItemClick,
  baseClassName = "block w-full text-left px-5 py-2.5 text-sm padding-x-5 padding-y-2.5 margin-x-2 rounded-lg transition-colors duration-150",
  className = "",
  children,
  disabled = false,
}) => {
  // Tách riêng classes cho trạng thái normal và disabled
  const normalClasses = "text-gray-800 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white cursor-pointer";
  const disabledClasses = "text-gray-400 bg-gray-100 dark:text-gray-600 dark:bg-gray-800 cursor-not-allowed";
  
  const stateClasses = disabled ? disabledClasses : normalClasses;
  const combinedClasses = `${baseClassName} ${stateClasses} ${className}`.trim();

  const handleClick = (event: React.MouseEvent) => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    
    if (tag === "button") {
      event.preventDefault();
    }
    if (onClick) onClick();
    if (onItemClick) onItemClick();
  };

  if (tag === "a" && href && !disabled) {
    return (
      <Link href={href} className={combinedClasses} onClick={handleClick}>
        {children}
      </Link>
    );
  }

  // Nếu là link nhưng disabled, render như span
  if (tag === "a" && disabled) {
    return (
      <span className={combinedClasses}>
        {children}
      </span>
    );
  }

  return (
    <button onClick={handleClick} className={combinedClasses} disabled={disabled}>
      {children}
    </button>
  );
};